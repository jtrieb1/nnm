use crate::utils::shopify::graphql::{actions::GraphQLQuery, api::CartAPIRepresentation, types::ShopifyGraphQLType};



#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct CartGetAPIResponse {
    pub cart: CartAPIRepresentation
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct FullCartGetResponse {
    pub data: CartGetAPIResponse
}

pub fn get_cart_query(id: &str) -> GraphQLQuery<CartAPIRepresentation>  {
    let mut query = GraphQLQuery::query(CartAPIRepresentation::default());
    query.add_variable("id".to_string(), ShopifyGraphQLType::ID(format!("gid://shopify/Cart/{}", id.to_string())));
    query
}