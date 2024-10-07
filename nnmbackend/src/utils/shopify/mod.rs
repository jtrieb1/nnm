/// This module provides utilities for interacting with Shopify's API.
///
/// The module includes submodules for handling cart operations, GraphQL queries, and payloads.
///
/// # Submodules
///
/// - `cart`: Contains functions for adding items to the cart, creating a cart, and retrieving cart details.
/// - `graphql`: Contains utilities for constructing and sending GraphQL queries.
/// - `payloads`: Contains structures and functions for handling payloads.
///
/// # Functions
///
/// - `send_shopify_request`: Sends a request to the Shopify API with the provided request body.
///
/// # Example
///
/// ```
/// use nnmbackend::utils::shopify::send_shopify_request;
/// use tokio;
///
/// #[tokio::main]
/// async fn main() {
///     let request_body = r#"{"query": "{ shop { name } }"}"#.to_string();
///     match send_shopify_request(request_body).await {
///         Ok(response) => println!("Response: {:?}", response),
///         Err(e) => eprintln!("Error: {:?}", e),
///     }
/// }
/// ```
///
/// # Errors
///
/// This function returns a `reqwest::Error` if there is an issue sending the request or receiving the response.

pub mod cart;
pub mod graphql;
pub mod payloads;

pub use cart::add_item::*;
pub use cart::create_cart::*;
pub use cart::get_cart::*;

use reqwest::{Error, Response};

pub async fn send_shopify_request(requestbody: String) -> Result<Response, Error> {
    let base_url: &str = &std::env::var("GATSBY_MYSHOPIFY_URL").unwrap();
    let api_key: &str = &std::env::var("SHOPIFY_STOREFRONT_KEY").unwrap();
    let api_version: &'static str = "2024-07";

    let client = reqwest::Client::new();
    client
        .post(format!("https://{}/api/{}/graphql", base_url, api_version))
        .header("X-Shopify-Storefront-Access-Token", api_key)
        .header("Content-Type", "application/json")
        .header("Accept", "application/json")
        .header("X-Shopify-Api-Version", api_version)
        .body(requestbody)
        .send()
        .await
}
