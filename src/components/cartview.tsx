import { Cart } from "./cart";

import React from 'react';

interface CartViewProps {
    cart: Cart;
    checkoutFn: () => void;
}

/// CartView is a component that displays the cart summary and a checkout button on the merch page
function CartView({ cart, checkoutFn }: CartViewProps) {
    return (
    <div className='cart-summary' aria-label="cart-summary">
        <h2 className="cart-summary-header" aria-label="cart-summary-header">Cart Summary</h2>
        <ul className="cart-summary-items" aria-label="cart-summary-items">
        {cart.items.map((item) => (
            <li key={item.product_id} className="cart-item" aria-label={`cart-item-${item.product_id}`}>
                <span className="cart-item-name" aria-label={`cart-item-name-${item.product_id}`}>{item.title}</span>
                <span className="cart-item-breakdown" aria-label={`cart-item-breakdown-${item.product_id}`}>{item.quantity} x ${item.price.toFixed(2)} {item.currency}</span>
                <span className="cart-item-total" aria-label={`cart-item-total-${item.product_id}`}>${(item.price * item.quantity).toFixed(2)} {item.currency}</span>
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