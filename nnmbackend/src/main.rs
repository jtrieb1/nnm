use std::time::Duration;

use actix_web::{http, web::{Json, Path}, App, HttpServer};
use aws_config::meta::region::RegionProviderChain;
use aws_config::BehaviorVersion;
use aws_sdk_s3::{presigning::PresigningConfigBuilder, types::error::NotFound, Client as S3Client, Error as S3Error};
use actix_cors::Cors;
use shopify::{FullAddItemResponse, FullCartCreateResponse, FullCartGetResponse, FullRemoveItemResponse};

mod shopify;

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    println!("Starting server on port 8000...");
    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600)
            .send_wildcard();
        App::new()
            .wrap(cors)
            .service(count_issues)
            .service(get_issue)
            .service(get_latest_issue)
            .service(create_checkout)
            .service(add_item_to_checkout)
            .service(remove_item_from_checkout)
            .service(get_checkout)
    })
    .bind(("0.0.0.0", 8000))?
    .run()
    .await
}

async fn get_s3_client() -> S3Client {
    let region_provider = RegionProviderChain::default_provider().or_else("us-east-2");
    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(region_provider)
        .load()
        .await;
    S3Client::new(&config)
}

#[actix_web::get("/count")]
async fn count_issues() -> String {
    let s3client = get_s3_client().await;
    match get_issue_count(&s3client).await {
        Ok(count) => format!("{{\"count\": {}}}", count),
        Err(e) => format!("{{\"error\": \"{}\"}}", e),
    }
}

#[actix_web::get("/issue/{issue_number}")]
async fn get_issue(issue_number: Path<usize>) -> actix_web::HttpResponse {
    // Returns signed URL for issue
    let s3client = get_s3_client().await;
    match get_signed_url_for_issue(issue_number.into_inner(), &s3client).await {
        Ok(url) => actix_web::HttpResponse::Ok().body(url),
        Err(e) => actix_web::HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}

#[actix_web::get("/issue/latest")]
async fn get_latest_issue() -> actix_web::HttpResponse {
    // Returns signed URL for latest issue
    let s3client = get_s3_client().await;
    match get_issue_count(&s3client).await {
        Ok(count) => match get_signed_url_for_issue(count, &s3client).await {
            Ok(url) => actix_web::HttpResponse::Ok().body(url),
            Err(e) => actix_web::HttpResponse::InternalServerError().body(format!("Error: {}", e)),
        },
        Err(e) => actix_web::HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}

#[actix_web::get("/create_checkout")]
async fn create_checkout() -> actix_web::HttpResponse {
    // Create a checkout session
    let payload = shopify::create_cart_mutation();

    let res = shopify::send_shopify_request(payload.to_payload()).await;
    match res {
        Ok(res) => {
            let body = res.text().await.unwrap();
            let parsed: FullCartCreateResponse = serde_json::from_str(&body).unwrap();
            let parsed = parsed.data.cart_create;
            if let Some(errors) = parsed.user_errors {
                if !errors.is_empty() {
                    // Send back GraphQL errors if there are any
                    return actix_web::HttpResponse::BadRequest().body(format!("{{\"error\": \"Error creating checkout session: {:?}\"}}", errors));
                }
            }
            return actix_web::HttpResponse::Ok().body(serde_json::to_string(&parsed.cart).unwrap());
        },
        Err(e) => return actix_web::HttpResponse::InternalServerError().body(format!("{{\"error\": \"Error creating checkout session: {:?}\"}}", e)),
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
struct ItemPayload {
    id: String,
    title: String,
    handle: String,
    description: String,
    price: f64,
    #[serde(rename = "shopifyId")]
    shopify_id: String,
}

#[actix_web::post("/add_item/{checkout_id}")]
async fn add_item_to_checkout(checkout_id: Path<String>, Json(payload): Json<ItemPayload>) -> actix_web::HttpResponse {

    // Add an item to a checkout session
    let request = shopify::add_item_mutation(&checkout_id, &payload.shopify_id);

    if let Ok(res) = shopify::send_shopify_request(request.to_payload()).await {
        let body = res.text().await.unwrap();
        let parsed: FullAddItemResponse = serde_json::from_str(&body).unwrap();
        let Some(parsed) = parsed.data.add_item else {
            // Send back GraphQL errors if there are any
            return actix_web::HttpResponse::BadRequest().body(format!("{{\"error\": \"Error: {:?}\" }}", parsed.errors));
        };
        if let Some(parsederrs) = parsed.user_errors {
            if !parsederrs.is_empty() {
                return actix_web::HttpResponse::BadRequest().body(format!("{{\"error\": \"Error: {:?}\" }}", parsederrs));
            }
        }
        return actix_web::HttpResponse::Ok().body("{{\"success\": \"Item added to cart\" }");
    } else {
        return actix_web::HttpResponse::InternalServerError().body("{ \"error\": \"Error adding item to cart\" }");
    }
}

#[actix_web::post("/remove_item/{checkout_id}")]
async fn remove_item_from_checkout(checkout_id: Path<String>, Json(payload): Json<ItemPayload>) -> actix_web::HttpResponse {

    let initial_request = shopify::get_line_id_for_item_query(&checkout_id, &payload.shopify_id);
    println!("{}", initial_request.to_payload());

    let Ok(response) = shopify::send_shopify_request(initial_request.to_payload()).await else {
        return actix_web::HttpResponse::InternalServerError().body("{ \"error\": \"Error removing item from cart\" }");
    };
    let body = response.text().await.unwrap();
    println!("{}", body);

    // Remove an item from a checkout session
    let request = shopify::remove_item_mutation(&checkout_id, &payload.shopify_id);

    println!("{}", request.to_payload());

    if let Ok(res) = shopify::send_shopify_request(request.to_payload()).await {
        let body = res.text().await.unwrap();
        println!("{}", body);
        let parsed: FullRemoveItemResponse = serde_json::from_str(&body).unwrap();
        let parsed = parsed.data.remove_item;
        if !parsed.user_errors.is_empty() {
            return actix_web::HttpResponse::BadRequest().body(format!("Error: {:?}", parsed.user_errors));
        }
        return actix_web::HttpResponse::Ok().body("Item removed from cart");
    } else {
        return actix_web::HttpResponse::InternalServerError().body("Error removing item from cart");
    }
}

#[actix_web::get("/checkout/{checkout_id}")]
async fn get_checkout(checkout_id: Path<String>) -> actix_web::HttpResponse {
    // Get the checkout session
    let get_checkout_query = shopify::get_cart_query(&checkout_id);

    println!("{}", get_checkout_query.to_payload());

    if let Ok(res) = shopify::send_shopify_request(get_checkout_query.to_payload()).await {
        let body = res.text().await.unwrap();
        println!("{}", body);
        let parsed: FullCartGetResponse = serde_json::from_str(&body).unwrap();
        let parsed = parsed.data.cart;
        return actix_web::HttpResponse::Ok().body(serde_json::to_string(&parsed).unwrap());
    } else {
        return actix_web::HttpResponse::InternalServerError().body("{ \"error\": \"Error getting checkout session\" }");
    }
}

async fn get_issue_count(s3client: &S3Client) -> Result<usize, S3Error> {
    if s3client.config().region().is_some_and(|reg| reg.as_ref() == "us-east-1") {
        let Ok(issues) = s3client.list_objects_v2().bucket("nonothingissues").send().await else {
            return Err(S3Error::NotFound(NotFound::builder().message("Issue with S3Client or bucket in us-east-1").build()));
        };
        Ok(issues.contents.unwrap_or_default().len())
    } else if s3client.config().region().is_some_and(|reg| reg.as_ref() == "us-east-2") {
        let Ok(issues) = s3client.list_objects_v2().bucket("nonothingissues").send().await else {
            return Err(S3Error::NotFound(NotFound::builder().message("Issue with S3Client or bucket in us-east-2").build()));
        };
        Ok(issues.contents.unwrap_or_default().len())
    } else {
        Err(S3Error::NotFound(NotFound::builder().message("Invalid region").build()))
    }
    
}

async fn get_signed_url_for_issue(issue_number: usize, s3client: &S3Client) -> Result<String, S3Error> {
    let issue_key = format!("issue_{}.pdf", issue_number);
    // Generate a signed URL for the issue
    let bucket = {
        if s3client.config().region().is_some_and(|reg| reg.as_ref() == "us-east-1") {
            "nonothingissues"
        } else if s3client.config().region().is_some_and(|reg| reg.as_ref() == "us-east-2") {
            "nonothingissues"
        } else {
            return Err(S3Error::NotFound(NotFound::builder().message("Invalid region").build()));
        }
    };
    let conf = PresigningConfigBuilder::default().expires_in(Duration::from_secs(10)).build().unwrap();
    let ret = s3client.get_object().bucket(bucket).key(issue_key).presigned(conf).await?;
    Ok(ret.uri().to_string())
}
