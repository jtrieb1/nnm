import Cart, { ItemResult } from "./cart";

import React from 'react';
import { useContext } from "react";
import { CartContext } from "../pages/merch";

interface CartViewProps {
    cart: Cart;
}

function CartView({ cart }: CartViewProps) {
    const [cartItems, setCartItems] = React.useState<Array<ItemResult>>([]);
    const [checkoutURL, setCheckoutURL] = React.useState<string>("");

    React.useEffect(() => {
        setCartItems(cart.getItems());
        cart.getCheckoutURL().then((url) => setCheckoutURL(url));
    }, [cart]);

    function initiate_checkout() {
        window.location.href = checkoutURL;
        cart.destruct();
    }

    return (
        <div>
            <h1>Cart</h1>
            <ul>
                {cartItems.map((item) => (
                    <li key={item.handle}>
                        {item.title} - ${item.price} {item.currency} - {item.quantity} : ${item.price * item.quantity} {item.currency}
                    </li>
                ))}
            </ul>
            <button onClick={initiate_checkout}>Checkout</button>
        </div>
    );
}

export default CartView;