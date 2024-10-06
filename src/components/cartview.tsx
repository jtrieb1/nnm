import { Cart } from "./cart";

import React from 'react';

interface CartViewProps {
    cart: Cart;
    checkoutFn: () => void;
}

function CartView({ cart, checkoutFn }: CartViewProps) {
    return (
    <div className='cart-summary'>
        <h2 className="cart-summary-header">Cart Summary</h2>
        <ul className="cart-summary-items">
        {cart.items.map((item) => (
            <li key={item.product_id} className="cart-item">
            <span className="cart-item-name">{item.title}</span>
            <span className="cart-item-breakdown">{item.quantity} x ${item.price.toFixed(2)} {item.currency}</span>
            <span className="cart-item-total">${(item.price * item.quantity).toFixed(2)} {item.currency}</span>
            </li>
        ))}
        </ul>
        <button 
        className="checkout-button"
        disabled={cart.items.length === 0}
        onClick={checkoutFn} 
        >
        Checkout
        </button>
    </div>
    );
}

export default CartView;