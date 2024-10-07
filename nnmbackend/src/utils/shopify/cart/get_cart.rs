/// This module provides utilities for interacting with Shopify's cart functionality via GraphQL.
///
/// The utilities include definitions for GraphQL queries, API representations, and Shopify-specific types.
///
/// # Modules
///
/// - `actions::GraphQLQuery`: Defines the structure and execution of GraphQL queries.
/// - `api::CartAPIRepresentation`: Represents the API structure for Shopify cart interactions.
/// - `types::ShopifyGraphQLType`: Contains type definitions specific to Shopify's GraphQL API.
///
/// # Example
///
/// ```
/// use crate::utils::shopify::cart::get_cart;
/// use crate::utils::shopify::graphql::actions::GraphQLQuery;
///
/// fn example() {
///     // Example usage of the GraphQLQuery for Shopify cart
///     let query = GraphQLQuery::new("query { cart { id } }");
///     // Further implementation...
/// }
/// ```
///
/// # Errors
///
/// Errors in this module may arise from issues with GraphQL query execution or API representation mismatches.

use crate::utils::shopify::graphql::{
    actions::GraphQLQuery, api::CartAPIRepresentation, types::ShopifyGraphQLType,
};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct CartGetAPIResponse {
    pub cart: CartAPIRepresentation,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct FullCartGetResponse {
    pub data: CartGetAPIResponse,
}

pub fn get_cart_query(id: &str) -> GraphQLQuery<CartAPIRepresentation> {
    let mut query = GraphQLQuery::query(CartAPIRepresentation::default());
    query.add_variable(
        "id".to_string(),
        ShopifyGraphQLType::ID(format!("gid://shopify/Cart/{}", id)),
    );
    query
}
