use crate::ItemPayload;

use super::{graphqlquery::{GraphQLQuery, ShopifyGraphQLType}, CartAPIRepresentation, GraphQLError, UserError};

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct AddItemAPIResponse {
    pub cart: CartAPIRepresentation,
    #[serde(rename = "userErrors")]
    pub user_errors: Option<Vec<UserError>>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct AddItemResponse {
    #[serde(rename = "cartLinesAdd")]
    pub add_item: Option<AddItemAPIResponse>
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct FullAddItemResponse {
    pub data: AddItemResponse,
    pub errors: Option<Vec<GraphQLError>>
}

fn create_shopify_line_entry(item_id: &str, item_qty: u32) -> ShopifyGraphQLType {
    ShopifyGraphQLType::Custom("CartLineInput".to_string(), ShopifyGraphQLType::Object(
        vec![
            ("merchandiseId".to_string(), ShopifyGraphQLType::ID(format!("{}", item_id))),
            ("quantity".to_string(), ShopifyGraphQLType::Int(item_qty as i64))
        ].into_iter().collect()
    ).into())
}

pub fn add_item_mutation(cart_id: &str, items: &Vec<ItemPayload>) -> GraphQLQuery<CartAPIRepresentation> {
    
    let mut aim = GraphQLQuery::mutation(CartAPIRepresentation::default(), Some("cartLinesAdd".to_string()));
    aim.add_variable("cartId".to_string(), ShopifyGraphQLType::ID(format!("gid://shopify/Cart/{}", cart_id)));
    aim.add_variable("lines".to_string(), ShopifyGraphQLType::Array(
        items.iter().map(|item: &ItemPayload| create_shopify_line_entry(&item.product_id, item.quantity)).collect::<Vec<ShopifyGraphQLType>>()
    ));
    
    return aim;
}