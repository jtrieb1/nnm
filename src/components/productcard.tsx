import React from 'react';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';
import Cart, { ItemResult } from './cart';
import { CartContext } from '../pages/merch';


interface ProductCardProps {
    nodeID: string;
    shopifyID: string;
    title: string;
    handle: string;
    description: string;
    img_src: IGatsbyImageData;
    price: string;
    currency: string;
    cartUpdater: React.Dispatch<React.SetStateAction<Cart>>;
}

const ProductCard: React.FC<ProductCardProps> = ({ shopifyID, title, handle, description, img_src, price, currency, nodeID, cartUpdater }) => {

    // Get the cart context
    const cart: Cart = React.useContext(CartContext);

    let result: ItemResult = {
        id: nodeID,
        title: title,
        handle: handle,
        description: description,
        currency: currency,
        price: parseFloat(price),
        shopifyId: shopifyID,
        quantity: 1
    };

    return (
        <div key={shopifyID} className="merchItem">
            <a href={`/products/${handle}`}>
                <h2>{title}</h2>
                <GatsbyImage image={img_src} alt={title} />
                <p>{description}</p>
                <p>{price} {currency}</p>
            </a>
            
            <button
                onClick={() => {
                    cart.addItem(result)
                    cartUpdater(cart);
                }}
            >
                Add to Cart
            </button>
            <button
                onClick={() => {
                    cart.removeItem(result);
                    cartUpdater(cart);
                }}
                disabled={!cart.hasItem(shopifyID)}
                style={{"display": `${cart.hasItem(shopifyID) ? 'block' : 'none'}`}}
            >
                Remove from Cart
            </button>
        </div>
    );
};

export default ProductCard;
