

/// This module defines the payload structures for handling Shopify-related data.
///
/// The payloads are used for representing items and cart items in Shopify integrations.
///
/// # Structs
///
/// - `ItemPayload`: Represents the structure of a single item payload.
/// - `MultiItemPayload`: Represents the structure of multiple item payloads.
/// - `CartItemPayload`: Represents the structure of a single cart item payload.
/// - `MultiCartItemPayload`: Represents the structure of multiple cart item payloads.
///
/// # Example
///
/// ```
/// use serde::{Deserialize, Serialize};
/// use nnmbackend::utils::shopify::payloads::{ItemPayload, MultiItemPayload, CartItemPayload, MultiCartItemPayload};
///
/// let item = ItemPayload {
///     product_id: "123".to_string(),
///     title: "Example Product".to_string(),
///     handle: "example-product".to_string(),
///     description: "This is an example product.".to_string(),
///     price: 19.99,
///     currency: "USD".to_string(),
///     quantity: 10,
/// };
///
/// let cart_item = CartItemPayload {
///     product_id: "123".to_string(),
///     title: "Example Product".to_string(),
///     handle: "example-product".to_string(),
///     description: "This is an example product.".to_string(),
///     price: 19.99,
///     currency: "USD".to_string(),
///     quantity: 2,
///     line_id: "line_1".to_string(),
/// };
///
/// let multi_item = MultiItemPayload {
///     items: vec![item.clone()],
/// };
///
/// let multi_cart_item = MultiCartItemPayload {
///     items: vec![cart_item.clone()],
/// };
/// ```
///
/// # Errors
///
/// These payloads do not perform any validation on their own. Ensure that the data provided to these structures is valid according to the application's requirements.

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ItemPayload {
    pub product_id: String,
    pub title: String,
    pub handle: String,
    pub description: String,
    pub price: f64,
    pub currency: String,
    pub quantity: u32,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct MultiItemPayload {
    pub items: Vec<ItemPayload>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct CartItemPayload {
    pub product_id: String,
    pub title: String,
    pub handle: String,
    pub description: String,
    pub price: f64,
    pub currency: String,
    pub quantity: u32,
    pub line_id: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct MultiCartItemPayload {
    pub items: Vec<CartItemPayload>,
}
