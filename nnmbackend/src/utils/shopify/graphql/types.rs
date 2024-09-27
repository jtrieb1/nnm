use std::collections::HashMap;

use super::traits::GraphQLRepresentable;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub enum ShopifyGraphQLType {
    ID(String),
    String(String),
    Boolean(bool),
    Int(i64),
    Float(f64),
    JSON(String),
    Array(Vec<ShopifyGraphQLType>),
    Object(HashMap<String, ShopifyGraphQLType>),
    Custom(String, Box<ShopifyGraphQLType>)
}

impl ShopifyGraphQLType {

    pub fn to_object(&self, key: &str) -> HashMap<String, ShopifyGraphQLType> {
        match self {
            ShopifyGraphQLType::Object(obj) => obj.clone(),
            _ => {
                let mut map = HashMap::new();
                map.insert(key.to_string(), self.clone());
                map
            }
        }
    }

    pub fn to_value_string(&self) -> String {
        match self {
            ShopifyGraphQLType::ID(v) => format!("\"{}\"", v),
            ShopifyGraphQLType::String(v) => format!("\"{}\"", v),
            ShopifyGraphQLType::Boolean(v) => format!("{}", v),
            ShopifyGraphQLType::Int(v) => format!("{}", v),
            ShopifyGraphQLType::Float(v) => format!("{}", v),
            ShopifyGraphQLType::JSON(v) => format!("{}", v),
            ShopifyGraphQLType::Array(v) => {
                let mut s = String::new();
                s.push_str("[");
                for item in v {
                    s.push_str(&format!("{}, ", item.to_value_string()));
                }
                if s.ends_with(", ") {
                    s.pop();
                    s.pop();
                }
                s.push_str("]");
                s
            },
            ShopifyGraphQLType::Object(v) => {
                let mut s = String::new();
                s.push_str("{");
                for (key, value) in v.iter() {
                    s.push_str(&format!("\"{}\": {}, ", key, value.to_value_string()));
                }
                if s.ends_with(", ") {
                    s.pop();
                    s.pop();
                }
                s.push_str("}");
                s
            },
            ShopifyGraphQLType::Custom(_, underlying) => underlying.to_value_string()
        }
    }

}

impl ToString for ShopifyGraphQLType {
    fn to_string(&self) -> String {
        match self {
            ShopifyGraphQLType::ID(_) => format!("ID!"),
            ShopifyGraphQLType::String(_) => format!("String!"),
            ShopifyGraphQLType::Boolean(_) => format!("Boolean!"),
            ShopifyGraphQLType::Int(_) => format!("Int!"),
            ShopifyGraphQLType::Float(_) => format!("Float!"),
            ShopifyGraphQLType::JSON(_) => format!("JSON!"),
            ShopifyGraphQLType::Array(t) => format!("[{}]!", if t.len() > 0 {t[0].to_string()} else { "".to_string() }),
            ShopifyGraphQLType::Object(h) => {
                let mut s = String::new();
                s.push_str("{");
                for (key, value) in h.iter() {
                    s.push_str(&format!("{}: {}, ", key, value.to_string()));
                }
                if s.ends_with(", ") {
                    s.pop();
                    s.pop();
                }
                s.push_str("}");
                s
            }
            ShopifyGraphQLType::Custom(t, _) => format!("{}!", t.clone())
        }
    }
}

#[derive(Debug, Default, Clone, serde::Deserialize, serde::Serialize)]
pub struct MoneyV2 {
    pub amount: String,
    #[serde(rename = "currencyCode")]
    pub currency_code: String,
}

impl GraphQLRepresentable for MoneyV2 {
    fn label(&self) -> String {
        "cost".to_string()
    }

    fn to_graphql(&self, _: HashMap<String, ShopifyGraphQLType>) -> String {
        format!("{{\n\tamount\n\tcurrencyCode\n}}")
    }
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

#[derive(Debug, Default, Clone, serde::Deserialize, serde::Serialize)]
pub struct CartLineCost {
    #[serde(rename = "amountPerQuantity")]
    amount_per_quantity: MoneyV2,
    #[serde(rename = "subtotalAmount")]
    subtotal_amount: MoneyV2,
    #[serde(rename = "totalAmount")]
    total_amount: MoneyV2,
}

impl GraphQLRepresentable for CartLineCost {
    fn label(&self) -> String {
        "cost".to_string()
    }

    fn to_graphql(&self, _: HashMap<String, ShopifyGraphQLType>) -> String {
        format!("{{\n\tamountPerQuantity {}\n\tsubtotalAmount {}\n\ttotalAmount {}\n}}",
            self.amount_per_quantity.to_graphql(HashMap::new()),
            self.subtotal_amount.to_graphql(HashMap::new()),
            self.total_amount.to_graphql(HashMap::new())
        )
    }
}

#[derive(Debug, Default, Clone, serde::Deserialize, serde::Serialize)]
pub struct Merchandise {
    pub id: String,
    pub title: String,
}

impl GraphQLRepresentable for Merchandise {
    fn label(&self) -> String {
        "merchandise".to_string()
    }
    fn to_graphql(&self, _: HashMap<String, ShopifyGraphQLType>) -> String {
        format!("{{\n... on ProductVariant {{\nid\ntitle\n}}\n}}")
    }
}

#[derive(Debug, Default, Clone, serde::Deserialize, serde::Serialize)]
pub struct LineItem {
    pub id: String,
    pub quantity: u32,
    pub merchandise: Merchandise,
    pub cost: CartLineCost
}

impl GraphQLRepresentable for LineItem {
    fn label(&self) -> String {
        "lines".to_string()
    }
    fn to_graphql(&self, args: HashMap<String, ShopifyGraphQLType>) -> String {
        format!("{{\nid\nquantity\nmerchandise {}\ncost {}}}", self.merchandise.to_graphql(HashMap::new()), self.cost.to_graphql(args))
    }
}