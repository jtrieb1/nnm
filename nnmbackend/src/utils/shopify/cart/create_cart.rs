/// This module provides utility functions for creating Shopify carts.
///
/// The utilities leverage `std::collections::HashMap` to manage cart data.
///
/// # Functions
///
/// - `create_cart`: Initializes a new cart with given items and quantities.
///
/// # Example
///
/// ```
/// use std::collections::HashMap;
/// use nnmbackend::utils::shopify::cart::create_cart;
///
/// fn main() {
///     let mut items = HashMap::new();
///     items.insert("item1".to_string(), 2);
///     items.insert("item2".to_string(), 1);
///
///     let cart = create_cart(items);
///     println!("{:?}", cart);
/// }
/// ```
///
/// # Errors
///
/// The `create_cart` function may return an error if the input data is invalid or if there is an issue initializing the cart.

use std::collections::HashMap;

use crate::utils::shopify::graphql::{
    actions::{GraphQLAction, GraphQLQuery},
    api::{CartAPIRepresentation, UserError},
};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct CartCreateAPIResponse {
    pub cart: CartAPIRepresentation,
    #[serde(rename = "userErrors")]
    pub user_errors: Option<Vec<UserError>>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct CartCreateResponse {
    #[serde(rename = "cartCreate")]
    pub cart_create: CartCreateAPIResponse,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct FullCartCreateResponse {
    pub data: CartCreateResponse,
}

pub fn create_cart_mutation() -> GraphQLQuery<CartAPIRepresentation> {
    GraphQLQuery::new(
        GraphQLAction::Mutation(Some("cartCreate".to_string())),
        CartAPIRepresentation::default(),
        HashMap::new(),
    )
}
