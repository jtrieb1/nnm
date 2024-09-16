use std::time::Duration;

use actix_web::{http, web::Json, App, HttpServer};
use aws_config::meta::region::RegionProviderChain;
use aws_config::BehaviorVersion;
use aws_sdk_s3::{presigning::PresigningConfigBuilder, types::error::NotFound, Client as S3Client, Error as S3Error};
use actix_cors::Cors;
use reqwest::{Error, Response};

#[actix_web::main]
async fn main() -> Result<(), std::io::Error> {
    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600)
            .send_wildcard();
        App::new()
            .wrap(cors)
            .service(count_issues)
            .service(get_issue)
            .service(get_latest_issue)
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
async fn get_issue(issue_number: actix_web::web::Path<usize>) -> actix_web::HttpResponse {
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

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
struct CostRepresentation {
    #[serde(rename = "checkoutChargeAmount")]
    checkout_charge_amount: f64,
    #[serde(rename = "subtotalAmount")]
    subtotal_amount: f64,
    #[serde(rename = "subtotalAmountEstimated")]
    subtotal_amount_estimated: bool,
    #[serde(rename = "totalAmount")]
    total_amount: f64,
    #[serde(rename = "totalAmountEstimated")]
    total_amount_estimated: bool,
    #[serde(rename = "totalDutyAmount")]
    total_duty_amount: f64,
    #[serde(rename = "totalDutyAmountEstimated")]
    total_duty_amount_estimated: bool,
    #[serde(rename = "totalTaxAmount")]
    total_tax_amount: f64,
    #[serde(rename = "totalTaxAmountEstimated")]
    total_tax_amount_estimated: bool,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
struct CartAPIRepresentation {
    id: String,
    #[serde(rename = "checkoutUrl")]
    checkout_url: String,
    cost: CostRepresentation,
    #[serde(rename = "totalQuantity")]
    total_quantity: u32,

}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
struct UserError {
    field: String,
    message: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
struct CartAPIResponse {
    cart: CartAPIRepresentation,
    #[serde(rename = "userErrors")]
    user_errors: Vec<UserError>,
}

#[actix_web::get("/create_checkout")]
async fn create_checkout() -> actix_web::HttpResponse {
    // Create a checkout session

    let create_mutation = r#"
        mutation cartCreate {
            cart {
                id
                checkoutUrl
                cost
                totalQuantity
            }
            userErrors {
                field,
                message
            }
        }
    "#;

    if let Ok(res) = send_shopify_request(create_mutation.to_string()).await {
        let body = res.text().await.unwrap();
        let parsed: CartAPIResponse = serde_json::from_str(&body).unwrap();
        if !parsed.user_errors.is_empty() {
            return actix_web::HttpResponse::BadRequest().body(format!("Error: {:?}", parsed.user_errors));
        }
        return actix_web::HttpResponse::Ok().body(serde_json::to_string(&parsed.cart).unwrap());

    } else {
        return actix_web::HttpResponse::InternalServerError().body("Error creating checkout session");
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
struct ItemPayload {
    title: String,
    handle: String,
    description: String,
    price: f64,
    #[serde(rename = "shopifyId")]
    shopify_id: String,
}

impl std::fmt::Display for ItemPayload {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, r#"{{
            merchandiseId: "{}",
            quantity: 1
        }}"#, self.shopify_id)
    }
}

struct ItemPayloadList(pub Vec<ItemPayload>);

impl std::fmt::Display for ItemPayloadList {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut items = Vec::new();
        for item in &self.0 {
            items.push(format!("{}", item));
        }
        write!(f, "[{}]", items.join(","))
    }
}

#[actix_web::post("/add_item/{checkout_id}")]
async fn add_item_to_checkout(checkout_id: String, Json(payload): Json<ItemPayload>) -> actix_web::HttpResponse {

    // Add an item to a checkout session
    let add_item_mutation = format!("
        cartLinesAdd(cartId: {}, lines: {}) {{
            cart {{
                id
                checkoutUrl
                cost
                totalQuantity
            }}
            userErrors {{
                field
                message
            }}
        }}
    ", checkout_id, ItemPayloadList(vec![payload]));

    if let Ok(res) = send_shopify_request(add_item_mutation).await {
        let body = res.text().await.unwrap();
        let parsed: CartAPIResponse = serde_json::from_str(&body).unwrap();
        if !parsed.user_errors.is_empty() {
            return actix_web::HttpResponse::BadRequest().body(format!("Error: {:?}", parsed.user_errors));
        }
        return actix_web::HttpResponse::Ok().body("Item added to cart");
    } else {
        return actix_web::HttpResponse::InternalServerError().body("Error adding item to cart");
    }
}

#[actix_web::post("/remove_item/{checkout_id}")]
async fn remove_item_from_checkout(checkout_id: String, Json(payload): Json<ItemPayload>) -> actix_web::HttpResponse {

    // Remove an item from a checkout session
    let remove_item_mutation = format!("
        cartLinesRemove(cartId: {}, lines: {}) {{
            cart {{
                id
                checkoutUrl
                cost
                totalQuantity
            }}
            userErrors {{
                field
                message
            }}
        }}
    ", checkout_id, ItemPayloadList(vec![payload]));

    if let Ok(res) = send_shopify_request(remove_item_mutation).await {
        let body = res.text().await.unwrap();
        let parsed: CartAPIResponse = serde_json::from_str(&body).unwrap();
        if !parsed.user_errors.is_empty() {
            return actix_web::HttpResponse::BadRequest().body(format!("Error: {:?}", parsed.user_errors));
        }
        return actix_web::HttpResponse::Ok().body("Item removed from cart");
    } else {
        return actix_web::HttpResponse::InternalServerError().body("Error removing item from cart");
    }
}

#[actix_web::get("/checkout/{checkout_id}")]
async fn get_checkout(checkout_id: String) -> actix_web::HttpResponse {
    // Get the checkout session
    let get_checkout_query = format!(r#"
        query getCheckout {{
            cart(id: {}) {{
                id
                checkoutUrl
                cost
                totalQuantity
            }}
            userErrors {{
                field
                message
            }}
        }}
    "#, checkout_id);

    if let Ok(res) = send_shopify_request(get_checkout_query).await {
        let body = res.text().await.unwrap();
        let parsed: CartAPIResponse = serde_json::from_str(&body).unwrap();
        if !parsed.user_errors.is_empty() {
            return actix_web::HttpResponse::BadRequest().body(format!("Error: {:?}", parsed.user_errors));
        }
        return actix_web::HttpResponse::Ok().body(serde_json::to_string(&parsed.cart).unwrap());
    } else {
        return actix_web::HttpResponse::InternalServerError().body("Error getting checkout session");
    }
}

async fn send_shopify_request(requestbody: String) -> Result<Response, Error> {
    let base_url: &'static str = env!("GATSBY_MYSHOPIFY_URL");
    let api_key: &'static str = env!("SHOPIFY_APP_PASSWORD");
    let api_version: &'static str = "2024-07";

    let client = reqwest::Client::new();
    client
        .post(base_url)
        .header("X-Shopify-Access-Token", api_key)
        .header("Content-Type", "application/json")
        .header("Accept", "application/json")
        .header("X-Shopify-Api-Version", api_version)
        .body(requestbody)
        .send()
        .await
}

async fn get_issue_count(s3client: &S3Client) -> Result<usize, S3Error> {
    if s3client.config().region().is_some_and(|reg| reg.as_ref() == "us-east-1") {
        let issues = s3client.list_objects_v2().bucket("nonothingissues1").send().await?;
        Ok(issues.contents.unwrap_or_default().len())
    } else if s3client.config().region().is_some_and(|reg| reg.as_ref() == "us-west-2") {
        let issues = s3client.list_objects_v2().bucket("nonothingissues").send().await?;
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
            "nonothingissues1"
        } else if s3client.config().region().is_some_and(|reg| reg.as_ref() == "us-west-2") {
            "nonothingissues"
        } else {
            return Err(S3Error::NotFound(NotFound::builder().message("Invalid region").build()));
        }
    };
    let conf = PresigningConfigBuilder::default().expires_in(Duration::from_secs(10)).build().unwrap();
    let ret = s3client.get_object().bucket(bucket).key(issue_key).presigned(conf).await?;
    Ok(ret.uri().to_string())
}
