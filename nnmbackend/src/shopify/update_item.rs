use super::{graphqlquery::{GraphQLQuery, ShopifyGraphQLType}, CartAPIRepresentation, GraphQLError, UserError};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct UpdateItemAPIResponse {
    pub cart: CartAPIRepresentation,
    #[serde(rename = "userErrors")]
    pub user_errors: Option<Vec<UserError>>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct UpdateItemResponse {
    #[serde(rename = "cartLinesUpdate")]
    pub add_item: Option<UpdateItemAPIResponse>
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct FullUpdateItemResponse {
    pub data: UpdateItemResponse,
    pub errors: Option<Vec<GraphQLError>>
}

pub fn update_item_mutation(cart_id: &str, _item_id: &str, item_line_id: &str, quantity: u32) -> GraphQLQuery<CartAPIRepresentation> {
    let mut uim = GraphQLQuery::mutation(CartAPIRepresentation::default(), Some("cartLinesUpdate".to_string()));
    uim.add_variable("cartId".to_string(), ShopifyGraphQLType::ID(format!("gid://shopify/Cart/{}", cart_id)));
    uim.add_variable("lines".to_string(), ShopifyGraphQLType::Array(vec![ShopifyGraphQLType::Custom("CartLineUpdateInput".to_string(), ShopifyGraphQLType::Object(
        vec![
            ("id".to_string(), ShopifyGraphQLType::ID(item_line_id.to_string())),
            ("merchandiseId".to_string(), ShopifyGraphQLType::ID(_item_id.to_string())),
            ("quantity".to_string(), ShopifyGraphQLType::Int(quantity as i64))
        ].into_iter().collect()
    ).into())]));
    
    return uim;
}