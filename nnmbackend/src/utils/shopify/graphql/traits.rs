/// A trait for types that can be represented in GraphQL format.
/// 
/// This trait requires implementing types to provide methods for converting
/// themselves into a GraphQL string representation and for providing a label
/// for the type.
/// 
/// # Requirements
/// 
/// Implementing types must be `Clone`.
/// 
/// # Methods
/// 
/// - `to_graphql(&self, args: HashMap<String, ShopifyGraphQLType>) -> String`:
///   Converts the implementing type into a GraphQL string representation using
///   the provided arguments.
/// 
/// - `label(&self) -> String`:
///   Returns a label for the implementing type.

use std::collections::HashMap;

use super::types::ShopifyGraphQLType;

pub trait GraphQLRepresentable: Clone {
    fn to_graphql(&self, args: HashMap<String, ShopifyGraphQLType>) -> String;
    fn label(&self) -> String;
}
