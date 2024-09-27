#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct ItemPayload {
    pub product_id: String,
    pub title: String,
    pub handle: String,
    pub description: String,
    pub price: f64,
    pub currency: String,
    pub quantity: u32,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct MultiItemPayload {
    pub items: Vec<ItemPayload>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct CartItemPayload {
    pub product_id: String,
    pub title: String,
    pub handle: String,
    pub description: String,
    pub price: f64,
    pub currency: String,
    pub quantity: u32,
    pub line_id: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
pub struct MultiCartItemPayload {
    pub items: Vec<CartItemPayload>,
}
