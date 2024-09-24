import BACKEND_URL from "../util/aws";

class Checkout {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;

    constructor(id: string, webUrl: string) {
        this.id = id;
        this.checkoutUrl = webUrl;
        this.totalQuantity = 0;
    }
}

export interface ItemResult {
    product_id: string;
    title: string;
    handle: string;
    description: string;
    currency: string;
    price: number;
    quantity: number;
}

export interface CartItemResult {
    line_id: string;
    title: string;
    handle: string;
    description: string;
    currency: string;
    price: number;
    product_id: string;
    quantity: number;
}