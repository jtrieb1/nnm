import BACKEND_URL from "../util/aws";

class Checkout {
    shopifyId: string;
    webUrl: string;

    constructor(id: string, webUrl: string) {
        this.shopifyId = id;
        this.webUrl = webUrl;
    }
}

export interface ItemResult {
    id: string;
    title: string;
    handle: string;
    description: string;
    currency: string;
    price: number;
    shopifyId: string;
    quantity: number;
}

class Cart {
    constructor() {
        this.checkoutID = "";
        this.items = [];
        this.checkout = null;
        this.initialized = false;
    }

    destruct() {
        localStorage.removeItem("checkoutID");
        this.checkoutID = "";
        this.items = [];
        this.checkout = null;
        this.initialized = false;
    }

    checkoutID: string;
    checkout: Checkout | null;
    items: ItemResult[];
    initialized: boolean;

    empty(): boolean {
        return this.items.length === 0;
    }

    hasItem(itemId: string): boolean {
        return this.items.some((i) => i.shopifyId === itemId);
    }

    setCheckoutID(id: string) {
        // IDs are prefixed with "gid://shopify/Cart/"
        // Strip that out
        this.checkoutID = id.replace("gid://shopify/Cart/", "");
    }

    async init() {
        // Get the checkout ID from local storage
        this.setCheckoutID(localStorage.getItem("nnmcheckoutID") || "");
        if (!this.checkoutID) {
            // If the checkout ID is not in local storage, create a new checkout
            const checkout = await this.createCheckout();
            this.checkout = checkout;
            console.log(this.checkout);
            this.setCheckoutID(checkout.shopifyId);
            localStorage.setItem("nnmcheckoutID", this.checkoutID);
            this.initialized = true;
        } else {
            this.initialized = true;
            // If the checkout ID is in local storage, get the checkout
            this.checkout = await this.getCheckout();
        }
    }

    async createCheckout(): Promise<Checkout> {
        // Tell the backend to create a checkout and return the ID
        let response = await fetch(`${BACKEND_URL}/create_checkout`, {  method: 'GET' });
        console.log(response);
        let data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        return data;
    }

    async getCheckout(): Promise<Checkout> {
        if (!this.initialized || !this.checkoutID) {
            await this.init();
        }
        // Tell the backend to get the checkout and return the ID
        let response = await fetch(`${BACKEND_URL}/checkout/${this.checkoutID}`, {  method: 'get' });
        let data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        return data;
    }

    async addItem(item: ItemResult) {
        // Scan for matching item first
        const existingItem = this.items.find((i) => i.shopifyId === item.shopifyId);
        if (existingItem) {
            existingItem.quantity += item.quantity;
            await fetch(`${BACKEND_URL}/add_item/${this.checkoutID}`, { method: 'POST', body: JSON.stringify(existingItem), headers: { 'Content-Type': 'application/json' } });
            return;
        }
        this.items.push(item);
        await fetch(`${BACKEND_URL}/add_item/${this.checkoutID}`, { method: 'POST', body: JSON.stringify(item), headers: { 'Content-Type': 'application/json' } });
    }

    async removeItem(item: ItemResult) {
        this.items = this.items.filter((i) => i !== item);
        if (this.items.length === 0) {
            this.destruct();
            return;
        }
        await fetch(`${BACKEND_URL}/remove_item/${this.checkoutID}`, { method: 'POST', body: JSON.stringify(item), headers: { 'Content-Type': 'application/json' } });
    }

    async getCheckoutURL(): Promise<string> {
        if (!this.initialized) { await this.init(); }
        return (await this.getCheckout()).webUrl;
    }

    getItems() {
        return this.items;
    }
}

export default Cart;