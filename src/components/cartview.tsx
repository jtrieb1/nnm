import { Cart } from "./cart";

import React from 'react';

interface CartViewProps {
    cart: Cart;
    checkoutFn: () => void;
}

function CartView({ cart, checkoutFn }: CartViewProps) {
    return (
    <div className='cart-summary'>
        <h2>Cart Summary</h2>
        <ul>
        {cart.items.map((item) => (
            <li key={item.product_id}>
            <span>{item.title}</span>
            <span>{item.quantity} x ${item.price.toFixed(2)} {item.currency}</span>
            <span>${(item.price * item.quantity).toFixed(2)} {item.currency}</span>
            </li>
        ))}
        </ul>
        <button 
        onClick={checkoutFn} 
        >
        Checkout
        </button>
    </div>
    );
}

export default CartView;