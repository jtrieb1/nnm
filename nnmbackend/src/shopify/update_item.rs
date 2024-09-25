use crate::CartItemPayload;

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

fn create_shopify_line_entry(item_id: &str, item_line_id: &str, quantity: u32) -> ShopifyGraphQLType {
    ShopifyGraphQLType::Custom("CartLineUpdateInput".to_string(), ShopifyGraphQLType::Object(
        vec![
            ("id".to_string(), ShopifyGraphQLType::ID(item_line_id.to_string())),
            ("merchandiseId".to_string(), ShopifyGraphQLType::ID(item_id.to_string())),
            ("quantity".to_string(), ShopifyGraphQLType::Int(quantity as i64))
        ].into_iter().collect()
    ).into())
}

pub fn update_item_mutation(cart_id: &str, item: &CartItemPayload) -> GraphQLQuery<CartAPIRepresentation> {
    let mut uim = GraphQLQuery::mutation(CartAPIRepresentation::default(), Some("cartLinesUpdate".to_string()));
    uim.add_variable("cartId".to_string(), ShopifyGraphQLType::ID(format!("gid://shopify/Cart/{}", cart_id)));
    uim.add_variable("lines".to_string(), ShopifyGraphQLType::Array(vec![
        create_shopify_line_entry(&item.product_id, &item.line_id, item.quantity)
    ]));
    
    return uim;
}