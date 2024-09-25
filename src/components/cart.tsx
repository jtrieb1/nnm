import BACKEND_URL from "../util/aws";

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

interface Money {
    amount: number;
    currencyCode: string;
}  

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

export class Cart {

    #id: string;
    #url: string;
    items: CartItemResult[];
    merchData: {node: any}[];

    constructor(id: string, merchData: {node: any}[]) {
        this.#id = id.replace("gid://shopify/Cart/", "");
        this.#url = "";
        this.items = [];
        this.merchData = merchData;
    }

    dupe(): Cart {
        let ct = new Cart(this.id(), [...this.merchData]);
        ct.set_url(this.url());
        ct.items = this.items.map((i) => {return {...i};});
        return ct;
    }

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