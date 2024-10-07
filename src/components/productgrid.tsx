import React from 'react';
import ProductCard from './productcard';
import { Cart } from './cart';

/// MerchNode is a type that represents a piece of merchandise.
/// These fields are returned from the current graphql queries.
export interface MerchNode {
    node: {
        id: string;
        title: string;
        handle: string;
        description: string;
        priceRangeV2: {
            maxVariantPrice: {
                currencyCode: string;
                amount: string;
            };
            minVariantPrice: {
                currencyCode: string;
                amount: string;
            };
        };
        featuredMedia: {
            preview: {
                image: {
                    gatsbyImageData: any;
                };
            };
        };
        variants: {
            shopifyId: string;
        }[];
        status: string;
    };
}

export interface ProductGridProps {
    cart: Cart,
    merchData: Array<MerchNode>,
    addItemCallback: (item: MerchNode) => void;
    removeItemCallback: (item: MerchNode) => void;
}

/// ProductGrid is a component that displays a grid of products in the merch store
const ProductGrid: React.FC<ProductGridProps> = ({ cart, merchData, addItemCallback, removeItemCallback }) => {
    return (
        <div className='product-grid'>
            {merchData.map(({ node }) => (
                <div key={node.id}>
                    <ProductCard
                        title={node.title}
                        description={node.description}
                        img_src={node.featuredMedia.preview.image.gatsbyImageData}
                        price={node.priceRangeV2.minVariantPrice.amount}
                        currency={node.priceRangeV2.minVariantPrice.currencyCode}
                    />
                    <div className="button-container">
                        <button
                            onClick={() => addItemCallback({node})}
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={() => removeItemCallback({node})}
                            disabled={cart.items.every(i => i.product_id != node.variants[0].shopifyId)}
                        >
                            Remove from Cart
                        </button> 
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ProductGrid;