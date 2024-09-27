use std::collections::HashMap;

use crate::utils::shopify::graphql::{actions::{GraphQLAction, GraphQLQuery}, api::{CartAPIRepresentation, UserError}};



#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct CartCreateAPIResponse {
    pub cart: CartAPIRepresentation,
    #[serde(rename = "userErrors")]
    pub user_errors: Option<Vec<UserError>>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct CartCreateResponse {
    #[serde(rename = "cartCreate")]
    pub cart_create: CartCreateAPIResponse
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct FullCartCreateResponse {
    pub data: CartCreateResponse
}

pub fn create_cart_mutation() -> GraphQLQuery<CartAPIRepresentation> {
    GraphQLQuery::new(
        GraphQLAction::Mutation(Some("cartCreate".to_string())), 
        CartAPIRepresentation::default(), 
        HashMap::new()
    )
}