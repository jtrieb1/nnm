import BACKEND_URL from "../../util/aws";

/// ItemResult is the result of a product query
export interface ItemResult {
    product_id: string;
    title: string;
    handle: string;
    description: string;
    currency: string;
    price: number;
    quantity: number;
}

/// CartItemResult is the result of a cart query
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

/// Convert an ItemResult to a CartItemResult, since they're essentially the same
/// Going backwards is easier, so we don't need a separate function for that
export function convertToCartItem(item: ItemResult): CartItemResult {
    return {
        line_id: "", // Blank for now
        title: item.title,
        handle: item.handle,
        description: item.description,
        currency: item.currency,
        price: item.price,
        product_id: item.product_id,
        quantity: item.quantity
    };
}

/// Money is a representation of the Shopify MoneyV2 object
interface Money {
    amount: number;
    currencyCode: string;
}  

/// CartLine is a representation of the Shopify CartLine object
interface CartLine {
    id: string;
    merchandise: {
      id: string;
      title: string;
      handle: string;
      description: string;
    };
    cost: {
      amountPerQuantity: Money;
    };
    quantity: number;
}

/// Convert a CartLine and a context to a CartItemResult
function cartItemFromCartLineAndCtx(cartline: CartLine, merchData: any): CartItemResult {
    let merchline = merchData.find((m: any) => m.node.variants[0].shopifyId == cartline.merchandise.id);
    return {
      product_id: cartline.merchandise.id,
      title: merchline.node.title,
      handle: merchline.node.handle,
      description: merchline.node.description,
      currency: cartline.cost.amountPerQuantity.currencyCode,
      price: Number(cartline.cost.amountPerQuantity.amount),
      line_id: cartline.id,
      quantity: cartline.quantity
    }
  }

/// Cart is a representation of a Shopify cart, but we handle most of the mechanisms
/// on the client side ourselves to prevent unnecessary server calls
export class Cart {

    // Private fields
    /// The Shopify ID of the corresponding cart object in the backend
    #id: string;
    /// The generated checkout URL for the cart
    #url: string;
    /// The items in the cart
    items: CartItemResult[];
    /// The data for all items offered in the store, for quick lookup
    merchData: {node: any}[];

    /// Create a new cart object
    constructor(id: string, merchData: {node: any}[]) {
        this.#id = id.replace("gid://shopify/Cart/", "");
        this.#url = "";
        this.items = [];
        this.merchData = merchData;
    }

    /// Create a deep copy of the cart
    dupe(): Cart {
        let ct = new Cart(this.id(), [...this.merchData]);
        ct.set_url(this.url());
        ct.items = this.items.map((i) => {return {...i};});
        return ct;
    }

    /// Initialize the cart from the backend
    async init(): Promise<void> {
        let existingID = localStorage.getItem('nnmcheckoutID');
        if (existingID) {
            this.set_id(existingID);
            let retval = await fetch(`${BACKEND_URL}/checkout/${this.id()}`, { method: 'GET' });
            let retjson = await retval.json();
            this.set_url(retjson.checkoutUrl);
            for (let cartline of retjson.lines.nodes) {
                this.items.push(cartItemFromCartLineAndCtx(cartline, this.merchData));
            }

        } else {
            let retval = await fetch(`${BACKEND_URL}/create_checkout`, { method: 'GET' });
            let retjson = await retval.json();
            this.set_id(retjson.id);
            this.set_url(retjson.checkoutUrl);
            for (let cartline of retjson.lines.nodes) {
                this.items.push(cartItemFromCartLineAndCtx(cartline, this.merchData));
            }
        }
    }

    id(): string {
        return this.#id;
    }

    /// Set the ID of the cart, but strip the Shopify prefix
    /// This is because we send the ID as a URL parameter, and the prefix is unnecessary
    set_id(id: string) {
        this.#id = id.replace("gid://shopify/Cart/", "");
        localStorage.setItem('nnmcheckoutID', this.#id);
    }

    url(): string {
        return this.#url;
    }

    set_url(url: string) {
        this.#url = url;
    }

    total(): number {
        return this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }

    currency(): string {
        return this.items.length !== 0 ? this.items[0].currency : "USD";
    }

    /// Sync the cart with the backend
    async sync(): Promise<void> {
        // If the cart is empty, don't bother
        if (this.items.length == 0) {
            return;
        }

        // Create payload
        let payload = {
            items: [...this.items]
        };

        // Send to backend
        let retval = await fetch(`${BACKEND_URL}/request_checkout`, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
        let retjson = await retval.json();
        this.set_id(retjson.id);
        this.set_url(retjson.checkoutUrl);
    }

    /// Add an item to the cart
    async add_item(item: ItemResult): Promise<void> {
        let existing = this.items.find((i) => i.product_id == item.product_id);
        let filtered = this.items.filter((i) => i.product_id != item.product_id);

        if (existing) {
            existing.quantity += item.quantity;
            filtered.push(existing);
        } else {
            filtered.push(convertToCartItem(item));
        }

        this.items = filtered;
        await this.sync();
    }

    /// Remove an item from the cart
    async remove_item(item: ItemResult): Promise<void> {
        let existing = this.items.find((i) => i.product_id == item.product_id);
        let filtered = this.items.filter((i) => i.product_id != item.product_id);

        if (existing) {
            existing.quantity -= item.quantity;
            if (existing.quantity > 0) {
                filtered.push(existing);
            }
        }

        this.items = filtered;
        await this.sync();
    }
}