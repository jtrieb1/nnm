use std::collections::HashMap;

use super::traits::GraphQLRepresentable;

/// Represents various types that can be used in Shopify GraphQL queries and responses.
///
/// This enum provides a way to handle different types of values that can be encountered
/// in Shopify's GraphQL API. Each variant corresponds to a specific GraphQL type.
///
/// # Variants
///
/// - `ID(String)`: Represents a GraphQL ID type.
/// - `String(String)`: Represents a GraphQL String type.
/// - `Boolean(bool)`: Represents a GraphQL Boolean type.
/// - `Int(i64)`: Represents a GraphQL Int type.
/// - `Float(f64)`: Represents a GraphQL Float type.
/// - `Json(String)`: Represents a JSON string.
/// - `Array(Vec<ShopifyGraphQLType>)`: Represents a GraphQL list type.
/// - `Object(HashMap<String, ShopifyGraphQLType>)`: Represents a GraphQL object type.
/// - `Custom(String, Box<ShopifyGraphQLType>)`: Represents a custom GraphQL type with a name and an underlying type.
///
/// # Methods
///
/// - `to_object(&self, key: &str) -> HashMap<String, ShopifyGraphQLType>`:
///   Converts the enum variant to a `HashMap` with the given key if it's not already an object.
///
/// - `to_value_string(&self) -> String`:
///   Converts the enum variant to its corresponding GraphQL value string representation.
///
/// # Example
///
/// ```
/// let id = ShopifyGraphQLType::ID("123".to_string());
/// let value_string = id.to_value_string();
/// assert_eq!(value_string, "\"123\"");
/// ```
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub enum ShopifyGraphQLType {
    ID(String),
    String(String),
    Boolean(bool),
    Int(i64),
    Float(f64),
    Json(String),
    Array(Vec<ShopifyGraphQLType>),
    Object(HashMap<String, ShopifyGraphQLType>),
    Custom(String, Box<ShopifyGraphQLType>),
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
            ShopifyGraphQLType::Json(v) => v.to_string(),
            ShopifyGraphQLType::Array(v) => {
                let mut s = String::new();
                s.push('[');
                for item in v {
                    s.push_str(&format!("{}, ", item.to_value_string()));
                }
                if s.ends_with(", ") {
                    s.pop();
                    s.pop();
                }
                s.push(']');
                s
            }
            ShopifyGraphQLType::Object(v) => {
                let mut s = String::new();
                s.push('{');
                for (key, value) in v.iter() {
                    s.push_str(&format!("\"{}\": {}, ", key, value.to_value_string()));
                }
                if s.ends_with(", ") {
                    s.pop();
                    s.pop();
                }
                s.push('}');
                s
            }
            ShopifyGraphQLType::Custom(_, underlying) => underlying.to_value_string(),
        }
    }
}

impl std::fmt::Display for ShopifyGraphQLType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ShopifyGraphQLType::ID(_) => write!(f, "ID!"),
            ShopifyGraphQLType::String(_) => write!(f, "String!"),
            ShopifyGraphQLType::Boolean(_) => write!(f, "Boolean!"),
            ShopifyGraphQLType::Int(_) => write!(f, "Int!"),
            ShopifyGraphQLType::Float(_) => write!(f, "Float!"),
            ShopifyGraphQLType::Json(_) => write!(f, "JSON!"),
            ShopifyGraphQLType::Array(t) => write!(
                f,
                "[{}]!",
                if !t.is_empty() {
                    t[0].to_string()
                } else {
                    "".to_string()
                }
            ),
            ShopifyGraphQLType::Object(h) => {
                let mut s = String::new();
                s.push('{');
                for (key, value) in h.iter() {
                    s.push_str(&format!("{}: {}, ", key, value));
                }
                if s.ends_with(", ") {
                    s.pop();
                    s.pop();
                }
                s.push('}');
                write!(f, "{}", s)
            }
            ShopifyGraphQLType::Custom(t, _) => write!(f, "{}!", t.clone()),
        }
    }
}

/// This struct is used to represent monetary values in Shopify's GraphQL API.
/// It contains the amount and currency code for the value.
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
        "{\n\tamount\n\tcurrencyCode\n}".to_string()
    }
}

/// This struct represents the cost of a cart in Shopify's GraphQL API.
/// It contains the checkout charge amount, subtotal amount, total amount, total duty amount, and total tax amount.
/// Each amount is represented as a `MoneyV2` struct.
/// The `subtotalAmountEstimated`, `totalAmountEstimated`, `totalDutyAmountEstimated`, and `totalTaxAmountEstimated` fields
/// indicate whether the amounts are estimated.
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

        if !args.is_empty() {
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

        s.push_str("checkoutChargeAmount {\n\tamount\n\tcurrencyCode\n}\n");
        s.push_str("subtotalAmount {\n\tamount\n\tcurrencyCode\n}\n");
        s.push_str("subtotalAmountEstimated\n");
        s.push_str("totalAmount {\n\tamount\n\tcurrencyCode\n}\n");
        s.push_str("totalAmountEstimated\n");
        s.push_str("totalDutyAmount {\n\tamount\n\tcurrencyCode\n}\n");
        s.push_str("totalDutyAmountEstimated\n");
        s.push_str("totalTaxAmount {\n\tamount\n\tcurrencyCode\n}\n");
        s.push_str("totalTaxAmountEstimated\n}");
        s
    }
}

/// This struct represents a merchandise item cost in Shopify's GraphQL API.
/// It contains the amount per quantity, subtotal amount, and total amount.
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
        format!(
            "{{\n\tamountPerQuantity {}\n\tsubtotalAmount {}\n\ttotalAmount {}\n}}",
            self.amount_per_quantity.to_graphql(HashMap::new()),
            self.subtotal_amount.to_graphql(HashMap::new()),
            self.total_amount.to_graphql(HashMap::new())
        )
    }
}

/// This struct represents a merchandise item in Shopify's GraphQL API.
/// It contains the ID and title of the merchandise.
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
        "{\n... on ProductVariant {\nid\ntitle\n}\n}".to_string()
    }
}

/// This struct represents a line item in Shopify's GraphQL API.
/// It contains the ID, quantity, merchandise, and cost of the line item.
#[derive(Debug, Default, Clone, serde::Deserialize, serde::Serialize)]
pub struct LineItem {
    pub id: String,
    pub quantity: u32,
    pub merchandise: Merchandise,
    pub cost: CartLineCost,
}

impl GraphQLRepresentable for LineItem {
    fn label(&self) -> String {
        "lines".to_string()
    }
    fn to_graphql(&self, args: HashMap<String, ShopifyGraphQLType>) -> String {
        format!(
            "{{\nid\nquantity\nmerchandise {}\ncost {}}}",
            self.merchandise.to_graphql(HashMap::new()),
            self.cost.to_graphql(args)
        )
    }
}
