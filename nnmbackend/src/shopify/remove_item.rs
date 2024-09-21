use super::{graphqlquery::{GraphQLQuery, ShopifyGraphQLType}, CartAPIRepresentation, UserError};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct RemoveItemAPIResponse {
    pub cart: CartAPIRepresentation,
    #[serde(rename = "userErrors")]
    pub user_errors: Vec<UserError>,
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

// Removing items requires extra work. We need to find the line ID by querying the cart first.
// This is because the line ID is not the same as the product ID.

// This function generates the query to get the line ID of the item we want to remove.
pub fn get_line_id_for_item_query(cart_id: &str, item_id: &str) -> GraphQLQuery<CartAPIRepresentation> {
    let mut query = GraphQLQuery::query(CartAPIRepresentation::default());
    query.add_variable("id".to_string(), ShopifyGraphQLType::ID(format!("gid://shopify/Cart/{}", cart_id)));
    query.add_variable("lines".to_string(), ShopifyGraphQLType::Array(vec![ShopifyGraphQLType::Custom("BaseCartLine".to_string(), ShopifyGraphQLType::Object(
        vec![
            ("id".to_string(), ShopifyGraphQLType::ID("".to_string())),
            ("merchandise".to_string(), ShopifyGraphQLType::Custom("Merchandise".to_string(), ShopifyGraphQLType::Object(
                vec![
                    ("id".to_string(), ShopifyGraphQLType::ID(item_id.to_string()))
                ].into_iter().collect()
            ).into()).into())
        ].into_iter().collect()
    ).into())]));

    return query;
}

pub fn remove_item_mutation(cart_id: &str, item_id: &str) -> GraphQLQuery<CartAPIRepresentation> {
    let mut rim = GraphQLQuery::mutation(CartAPIRepresentation::default(), Some("cartLinesRemove".to_string()));
    rim.add_variable("cartId".to_string(), ShopifyGraphQLType::ID(format!("gid://shopify/Cart/{}", cart_id)));
    rim.add_variable("lineIds".to_string(), ShopifyGraphQLType::Array(vec![ShopifyGraphQLType::ID(item_id.to_string())]));

    return rim;
}