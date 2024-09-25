import React from 'react';

import Layout from '../components/layout';
import SegmentHeader from '../components/segmentheader';
import ProductCard from '../components/productcard';
import { graphql, HeadFC, useStaticQuery } from 'gatsby';
import { getImage } from 'gatsby-plugin-image';

import { Cart, ItemResult } from '../components/cart';


// Query for the merch data
export const pageQuery = graphql`
{
  allShopifyProduct(sort: {title: ASC}) {
    edges {
      node {
        id
        title
        handle
        description
        variants {
          shopifyId
        }
        priceRangeV2 {
          maxVariantPrice {
            currencyCode
            amount
          }
          minVariantPrice {
            currencyCode
            amount
          }
        }
        featuredMedia {
            preview {
                image {
                    gatsbyImageData(
                        width: 200
                        placeholder: BLURRED
                    )
                }
            }
        }
        status
      }
    }
  }
}
`;


function MerchPage() {
    // Use the graphql query to get the merch data
    const response = useStaticQuery(pageQuery);
    const merchData = response.allShopifyProduct.edges;

    // Initialize the cart
    const [cart, setCart] = React.useState<Cart>(new Cart("", merchData));

    React.useEffect(() => {
      if (cart.id() === "") {
        cart.init().then(() => {
          setCart(cart.dupe());
        });
      }
    }, [cart]);

    async function initiate_checkout() {
      window.location.href = cart.url();
    }

    async function add_item(item: ItemResult) {
      await cart.add_item(item).then(() => {
        setCart(cart.dupe());
      });
    }

    async function remove_item(item: ItemResult) {
      await cart.remove_item(item).then(() => {
        setCart(cart.dupe());
      });
    }

    return (
        <Layout>
            <SegmentHeader headerText="Merch" />
            <div className="merch">
                <div className='merchGrid'>
                {
                    merchData.map(({ node }: { node: any }) => {
                        const { title, handle, description, priceRangeV2, featuredMedia, variants, id } = node;
                  
                        const price = priceRangeV2.minVariantPrice.amount;
                        const img_src = getImage(featuredMedia.preview.image);
                        if (!img_src) {
                            return null;
                        }

                        const item = {
                          title: title,
                          handle: handle,
                          description: description,
                          currency: priceRangeV2.minVariantPrice.currencyCode,
                          price: Number(price),
                          product_id: variants[0].shopifyId,
                          quantity: 1
                        };

                        return (
                          <div key={id} className="merchItem">
                          <ProductCard 
                              key={id} 
                              title={title} 
                              description={description} 
                              img_src={img_src} 
                              price={price} 
                              currency={priceRangeV2.minVariantPrice.currencyCode}
                            />
                            <button
                                  onClick={async () => await add_item(item)}
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={async () => await remove_item(item)}
                                disabled={cart.items.every(i => i.product_id != variants[0].shopifyId)}
                                style={{"display": `${cart.items.some(i => i.product_id == variants[0].shopifyId) ? 'block' : 'none'}`}}
                            >
                                Remove from Cart
                            </button> 
                          </div>
                        );
                    })
                }
                </div>
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
                    onClick={initiate_checkout} 
                  >
                    Checkout
                  </button>
                </div>
            </div>
        </Layout>
    );
}

export default MerchPage;

export const Head: HeadFC = () => <title>no nothing magazine | merch</title>
