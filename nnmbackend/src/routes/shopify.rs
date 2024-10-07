/// This module defines the routes for handling Shopify checkout operations.
///
/// The routes are defined using Actix-web and handle various operations related to Shopify checkouts,
/// including creating a checkout session, adding items to a checkout, and retrieving checkout details.
///
/// # Routes
///
/// - `GET /create_checkout`: Creates a new checkout session.
/// - `POST /request_checkout`: Requests a new checkout and adds items to it.
/// - `GET /checkout/{checkout_id}`: Retrieves the details of an existing checkout session.
///
/// # Example
///
/// ```
/// use actix_web::{web, App, HttpServer};
/// use nnmbackend::routes::shopify;
///
/// #[actix_web::main]
/// async fn main() -> std::io::Result<()> {
///     HttpServer::new(|| {
///         App::new()
///             .service(shopify::create_checkout)
///             .service(shopify::execute_checkout)
///             .service(shopify::get_checkout)
///     })
///     .bind("127.0.0.1:8080")?
///     .run()
///     .await
/// }
/// ```
///
/// # Errors
///
/// These routes return an `InternalServerError` if there is an issue processing the Shopify request.
/// They may also return a `BadRequest` if there are user errors in the GraphQL response.
use actix_web::web::{Json, Path};

use crate::utils::shopify::{
    add_items_mutation, create_cart_mutation, get_cart_query, payloads::MultiItemPayload,
    send_shopify_request, FullAddItemResponse, FullCartCreateResponse, FullCartGetResponse,
};

#[actix_web::get("/create_checkout")]
async fn create_checkout() -> actix_web::HttpResponse {
    // Create a checkout session
    let payload = create_cart_mutation();

    let res = send_shopify_request(payload.to_payload()).await;
    match res {
        Ok(res) => {
            let body = res.text().await.unwrap();
            let parsed: FullCartCreateResponse = serde_json::from_str(&body).unwrap();
            let parsed = parsed.data.cart_create;
            if let Some(errors) = parsed.user_errors {
                if !errors.is_empty() {
                    // Send back GraphQL errors if there are any
                    return actix_web::HttpResponse::BadRequest().body(format!(
                        "{{\"error\": \"Error creating checkout session: {:?}\"}}",
                        errors
                    ));
                }
            }
            actix_web::HttpResponse::Ok()
                .body(serde_json::to_string(&parsed.cart).unwrap())
        }
        Err(e) => {
            actix_web::HttpResponse::InternalServerError().body(format!(
                "{{\"error\": \"Error creating checkout session: {:?}\"}}",
                e
            ))
        }
    }
}

#[actix_web::post("/request_checkout")]
async fn execute_checkout(Json(payload): Json<MultiItemPayload>) -> actix_web::HttpResponse {
    // First, request a new checkout
    let request = create_cart_mutation();
    let res = send_shopify_request(request.to_payload()).await;
    if let Err(e) = res {
        return actix_web::HttpResponse::InternalServerError().body(format!(
            "{{\"error\": \"Error creating checkout session: {:?}\"}}",
            e
        ));
    }
    let body = res.unwrap().text().await.unwrap();
    let parsed: FullCartCreateResponse = serde_json::from_str(&body).unwrap();
    let parsed = parsed.data.cart_create;
    if let Some(errors) = parsed.user_errors {
        if !errors.is_empty() {
            // Send back GraphQL errors if there are any
            return actix_web::HttpResponse::BadRequest().body(format!(
                "{{\"error\": \"Error creating checkout session: {:?}\"}}",
                errors
            ));
        }
    }
    let cart_id = parsed.cart.id.strip_prefix("gid://shopify/Cart/").unwrap();

    let request = add_items_mutation(cart_id, &payload);
    println!("[line 146]: {}", request.to_payload());

    if let Ok(res) = send_shopify_request(request.to_payload()).await {
        let body = res.text().await.unwrap();
        println!("[line 149]: {}", body);
        let parsed: FullAddItemResponse = serde_json::from_str(&body).unwrap();
        let Some(parsed) = parsed.data.add_item else {
            // Send back GraphQL errors if there are any
            return actix_web::HttpResponse::BadRequest()
                .body(format!("{{\"error\": \"Error: {:?}\" }}", parsed.errors));
        };
        if let Some(parsederrs) = parsed.user_errors {
            if !parsederrs.is_empty() {
                return actix_web::HttpResponse::BadRequest()
                    .body(format!("{{\"error\": \"Error: {:?}\" }}", parsederrs));
            }
        }
        actix_web::HttpResponse::Ok().body(serde_json::to_string(&parsed.cart).unwrap())
    } else {
        actix_web::HttpResponse::InternalServerError()
            .body("{ \"error\": \"Error adding item to cart\" }")
    }
}

#[actix_web::get("/checkout/{checkout_id}")]
async fn get_checkout(checkout_id: Path<String>) -> actix_web::HttpResponse {
    // Get the checkout session
    let get_checkout_query = get_cart_query(&checkout_id);

    if let Ok(res) = send_shopify_request(get_checkout_query.to_payload()).await {
        let body = res.text().await.unwrap();
        let parsed: FullCartGetResponse = serde_json::from_str(&body).unwrap();
        let parsed = parsed.data.cart;
        actix_web::HttpResponse::Ok().body(serde_json::to_string(&parsed).unwrap())
    } else {
        actix_web::HttpResponse::InternalServerError()
            .body("{ \"error\": \"Error getting checkout session\" }")
    }
}
