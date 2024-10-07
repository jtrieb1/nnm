/// This module provides functionality for adding items to a Shopify cart using GraphQL.
///
/// The module defines the necessary structures and functions to create and execute a GraphQL mutation
/// for adding items to a Shopify cart.
///
/// # Structs
///
/// - `AddItemAPIResponse`: Represents the response from the Shopify API when adding an item to the cart.
/// - `AddItemResponse`: Represents the nested response structure for the `cartLinesAdd` mutation.
/// - `FullAddItemResponse`: Represents the full response from the Shopify API, including potential errors.
///
/// # Functions
///
/// - `create_shopify_line_entry`: Creates a Shopify GraphQL line entry for a given item ID and quantity.
/// - `add_items_mutation`: Constructs a GraphQL mutation for adding items to a Shopify cart.
///
/// # Example
///
/// ```
/// use nnmbackend::utils::shopify::cart::add_item::{add_items_mutation, MultiItemPayload};
///
/// let cart_id = "example_cart_id";
/// let item_payload = MultiItemPayload {
///     items: vec![
///         // Add items here
///     ],
/// };
///
/// let mutation = add_items_mutation(cart_id, &item_payload);
/// // Execute the mutation using your GraphQL client
/// ```
///
/// # Errors
///
/// This module may return errors related to GraphQL query execution or Shopify API responses.

use crate::utils::shopify::{
    graphql::{
        actions::GraphQLQuery,
        api::{CartAPIRepresentation, GraphQLError, UserError},
        types::ShopifyGraphQLType,
    },
    payloads::MultiItemPayload,
};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct AddItemAPIResponse {
    pub cart: CartAPIRepresentation,
    #[serde(rename = "userErrors")]
    pub user_errors: Option<Vec<UserError>>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct AddItemResponse {
    #[serde(rename = "cartLinesAdd")]
    pub add_item: Option<AddItemAPIResponse>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct FullAddItemResponse {
    pub data: AddItemResponse,
    pub errors: Option<Vec<GraphQLError>>,
}

fn create_shopify_line_entry(item_id: &str, item_qty: u32) -> ShopifyGraphQLType {
    ShopifyGraphQLType::Custom(
        "CartLineInput".to_string(),
        ShopifyGraphQLType::Object(
            vec![
                (
                    "merchandiseId".to_string(),
                    ShopifyGraphQLType::ID(item_id.to_string()),
                ),
                (
                    "quantity".to_string(),
                    ShopifyGraphQLType::Int(item_qty as i64),
                ),
            ]
            .into_iter()
            .collect(),
        )
        .into(),
    )
}

pub fn add_items_mutation(
    cart_id: &str,
    item: &MultiItemPayload,
) -> GraphQLQuery<CartAPIRepresentation> {
    let mut aim = GraphQLQuery::mutation(
        CartAPIRepresentation::default(),
        Some("cartLinesAdd".to_string()),
    );
    aim.add_variable(
        "cartId".to_string(),
        ShopifyGraphQLType::ID(format!("gid://shopify/Cart/{}", cart_id)),
    );
    aim.add_variable(
        "lines".to_string(),
        ShopifyGraphQLType::Array(
            item.items
                .iter()
                .map(|item| create_shopify_line_entry(&item.product_id, item.quantity))
                .collect(),
        ),
    );

    aim
}
