use std::collections::HashMap;

use super::types::ShopifyGraphQLType;

pub trait GraphQLRepresentable {
    fn to_graphql(&self, args: HashMap<String, ShopifyGraphQLType>) -> String;
    fn label(&self) -> String;
}