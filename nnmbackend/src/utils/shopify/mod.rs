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
