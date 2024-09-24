use super::{graphqlquery::{GraphQLQuery, ShopifyGraphQLType}, CartAPIRepresentation, UserError};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct RemoveItemAPIResponse {
    pub cart: CartAPIRepresentation,
    #[serde(rename = "userErrors")]
    pub user_errors: Option<Vec<UserError>>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct RemoveItemResponse {
    #[serde(rename = "cartLinesRemove")]
    pub remove_item: RemoveItemAPIResponse
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct FullRemoveItemResponse {
    pub data: RemoveItemResponse
}

pub fn remove_item_mutation(cart_id: &str, item_id: &str) -> GraphQLQuery<CartAPIRepresentation> {
    let mut rim = GraphQLQuery::mutation(CartAPIRepresentation::default(), Some("cartLinesRemove".to_string()));
    rim.add_variable("cartId".to_string(), ShopifyGraphQLType::ID(format!("gid://shopify/Cart/{}", cart_id)));
    rim.add_variable("lineIds".to_string(), ShopifyGraphQLType::Array(vec![ShopifyGraphQLType::ID(item_id.to_string())]));

    return rim;
}