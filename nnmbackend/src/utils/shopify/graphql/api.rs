/// This module provides utility functions for interacting with the Shopify GraphQL API.
///
/// The utilities are designed to facilitate the construction and execution of GraphQL queries and mutations.
///
/// # Dependencies
///
/// - `std::collections::HashMap`: Used for storing key-value pairs in various utility functions.
///
/// # Errors
///
/// Functions in this module may return errors if there are issues with network requests or if the GraphQL API returns errors.

use std::collections::HashMap;

use super::{
    traits::GraphQLRepresentable,
    types::{CostRepresentation, LineItem, MoneyV2, ShopifyGraphQLType},
};

#[derive(Debug, Clone, Default, serde::Deserialize, serde::Serialize)]
pub struct LineItemAPIRepresentation {
    pub nodes: Vec<LineItem>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct CartAPIRepresentation {
    pub id: String,
    #[serde(rename = "checkoutUrl")]
    pub checkout_url: String,
    pub cost: CostRepresentation,
    #[serde(rename = "totalQuantity")]
    pub total_quantity: u32,
    pub lines: LineItemAPIRepresentation,
}

impl Default for CartAPIRepresentation {
    fn default() -> Self {
        Self {
            id: "".to_string(),
            checkout_url: "".to_string(),
            cost: CostRepresentation {
                checkout_charge_amount: MoneyV2 {
                    amount: "".to_string(),
                    currency_code: "".to_string(),
                },
                subtotal_amount: MoneyV2 {
                    amount: "".to_string(),
                    currency_code: "".to_string(),
                },
                subtotal_amount_estimated: false,
                total_amount: MoneyV2 {
                    amount: "".to_string(),
                    currency_code: "".to_string(),
                },
                total_amount_estimated: false,
                total_duty_amount: None,
                total_duty_amount_estimated: false,
                total_tax_amount: None,
                total_tax_amount_estimated: false,
            },
            total_quantity: 0,
            lines: LineItemAPIRepresentation::default(),
        }
    }
}

fn add_tabs_to_lines(s: &str, tabs: u32) -> String {
    let mut new_s = String::new();
    for line in s.lines() {
        for _ in 0..tabs {
            new_s.push('\t');
        }
        new_s.push_str(line);
        new_s.push('\n');
    }
    new_s
}

impl GraphQLRepresentable for CartAPIRepresentation {
    fn label(&self) -> String {
        "cart".to_string()
    }
    fn to_graphql(&self, args: HashMap<String, ShopifyGraphQLType>) -> String {
        let mut s = String::new();

        if !args.is_empty() {
            s.push_str("cart(");
            for arg in args {
                s.push_str(&arg.0);
                s.push_str(": ");
                s.push_str(&format!("${}", arg.0));
                s.push_str(", ");
            }
            s.pop();
            s.pop();
            s.push_str(") {\n\tid\n\tcheckoutUrl\n");
        } else {
            s.push_str("cart {\n\tid\n\tcheckoutUrl\n");
        }

        s.push_str(&add_tabs_to_lines(&self.cost.to_graphql(HashMap::new()), 1));
        s.push_str(&format!(
            "\ntotalQuantity\nlines(first: 250) {{\nnodes {}\n}}\n}}",
            LineItem::default().to_graphql(HashMap::new())
        ));
        s
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct UserError {
    pub field: String,
    pub message: String,
}

impl GraphQLRepresentable for UserError {
    fn label(&self) -> String {
        "userError".to_string()
    }
    fn to_graphql(&self, _: HashMap<String, ShopifyGraphQLType>) -> String {
        "{ field\nmessage }".to_string()
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct GraphQLError {
    pub message: String,
    pub path: Vec<String>,
    pub locations: Vec<String>,
}
