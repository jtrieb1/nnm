mod add_item;
mod create_cart;
mod get_cart;
mod graphqlquery;
mod remove_item;

use std::collections::HashMap;

pub use add_item::*;
pub use create_cart::*;
pub use get_cart::*;
use graphqlquery::{GraphQLRepresentable, ShopifyGraphQLType};
pub use remove_item::*;
use reqwest::{Error, Response};

fn add_tabs_to_lines(s: &str, tabs: u32) -> String {
    let mut new_s = String::new();
    for line in s.lines() {
        for _ in 0..tabs {
            new_s.push_str("\t");
        }
        new_s.push_str(line);
        new_s.push_str("\n");
    }
    new_s
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct MoneyV2 {
    pub amount: String,
    #[serde(rename = "currencyCode")]
    pub currency_code: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct CostRepresentation {
    #[serde(rename = "checkoutChargeAmount")]
    pub checkout_charge_amount: MoneyV2,
    #[serde(rename = "subtotalAmount")]
    pub subtotal_amount: MoneyV2,
    #[serde(rename = "subtotalAmountEstimated")]
    pub subtotal_amount_estimated: bool,
    #[serde(rename = "totalAmount")]
    pub total_amount: MoneyV2,
    #[serde(rename = "totalAmountEstimated")]
    pub total_amount_estimated: bool,
    #[serde(rename = "totalDutyAmount")]
    pub total_duty_amount: Option<MoneyV2>,
    #[serde(rename = "totalDutyAmountEstimated")]
    pub total_duty_amount_estimated: bool,
    #[serde(rename = "totalTaxAmount")]
    pub total_tax_amount: Option<MoneyV2>,
    #[serde(rename = "totalTaxAmountEstimated")]
    pub total_tax_amount_estimated: bool,
}

impl GraphQLRepresentable for CostRepresentation {
    fn label(&self) -> String {
        "cost".to_string()
    }

    fn to_graphql(&self, args: HashMap<String, ShopifyGraphQLType>) -> String {
        let mut s = String::new();

        if args.len() > 0 {
            s.push_str("cost(");
            for arg in args {
                s.push_str(&arg.0);
                s.push_str(": ");
                s.push_str(&arg.1.to_string());
                s.push_str(", ");
            }
            s.push_str(") {\n");
        } else {
            s.push_str("cost {\n");
        }

        s.push_str(&format!("checkoutChargeAmount {{\n\tamount\n\tcurrencyCode\n}}\n"));
        s.push_str(&format!("subtotalAmount {{\n\tamount\n\tcurrencyCode\n}}\n"));
        s.push_str(&format!("subtotalAmountEstimated\n"));
        s.push_str(&format!("totalAmount {{\n\tamount\n\tcurrencyCode\n}}\n"));
        s.push_str(&format!("totalAmountEstimated\n"));
        s.push_str(&format!("totalDutyAmount {{\n\tamount\n\tcurrencyCode\n}}\n"));
        s.push_str(&format!("totalDutyAmountEstimated\n"));
        s.push_str(&format!("totalTaxAmount {{\n\tamount\n\tcurrencyCode\n}}\n"));
        s.push_str(&format!("totalTaxAmountEstimated\n}}"));
        s
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct CartAPIRepresentation {
    pub id: String,
    #[serde(rename = "checkoutUrl")]
    pub checkout_url: String,
    pub cost: CostRepresentation,
    #[serde(rename = "totalQuantity")]
    pub total_quantity: u32,
}

impl Default for CartAPIRepresentation {
    fn default() -> Self {
        Self {
            id: "".to_string(),
            checkout_url: "".to_string(),
            cost: CostRepresentation {
                checkout_charge_amount: MoneyV2 {
                    amount: "".to_string(),
                    currency_code: "".to_string()
                },
                subtotal_amount: MoneyV2 {
                    amount: "".to_string(),
                    currency_code: "".to_string()
                },
                subtotal_amount_estimated: false,
                total_amount: MoneyV2 {
                    amount: "".to_string(),
                    currency_code: "".to_string()
                },
                total_amount_estimated: false,
                total_duty_amount: None,
                total_duty_amount_estimated: false,
                total_tax_amount: None,
                total_tax_amount_estimated: false
            },
            total_quantity: 0
        }
    }
}

impl GraphQLRepresentable for CartAPIRepresentation {
    fn label(&self) -> String {
        "cart".to_string()
    }
    fn to_graphql(&self, args: HashMap<String, ShopifyGraphQLType>) -> String {
        let mut s = String::new();

        if args.len() > 0 {
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
        s.push_str(&format!("\ntotalQuantity\n}}"));
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
        format!("{{ field\nmessage }}")
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct GraphQLError {
    pub message: String,
    pub path: Vec<String>,
    pub locations: Vec<String>,
}

pub async fn send_shopify_request(requestbody: String) -> Result<Response, Error> {
    let base_url: &str = &std::env::var("GATSBY_MYSHOPIFY_URL").unwrap();
    let api_key: &str = &std::env::var("SHOPIFY_STOREFRONT_KEY").unwrap();
    let api_version: &'static str = "2024-07";

    let client = reqwest::Client::new();
    client
        .post(format!("https://{}/api/{}/graphql", base_url, api_version))
        .header("X-Shopify-Storefront-Access-Token", api_key)
        .header("Content-Type", "application/json")
        .header("Accept", "application/json")
        .header("X-Shopify-Api-Version", api_version)
        .body(requestbody)
        .send()
        .await
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct LineItem {
    pub quantity: u32,
    pub merchandise_id: String,
}

impl GraphQLRepresentable for LineItem {
    fn label(&self) -> String {
        "lines".to_string()
    }
    fn to_graphql(&self, _: HashMap<String, ShopifyGraphQLType>) -> String {
        format!("{{\nquantity\nmerchandiseId\n}}")
    }
}