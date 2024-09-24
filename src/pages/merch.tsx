import React from 'react';

import Layout from '../components/layout';
import SegmentHeader from '../components/segmentheader';
import ProductCard from '../components/productcard';
import { graphql, HeadFC, useStaticQuery } from 'gatsby';
import { getImage } from 'gatsby-plugin-image';

import {CartItemResult, ItemResult} from '../components/cart';
import BACKEND_URL from '../util/aws';

class Checkout {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;

  constructor(id: string, webUrl: string) {
      this.id = id;
      this.checkoutUrl = webUrl;
      this.totalQuantity = 0;
  }
}

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

interface Money {
  amount: number;
  currencyCode: string;
}

interface Checkout {
    id: string,
    checkoutUrl: string,
    lines: {
      nodes: Array<{
        merchandise: {
          id: string,
          title: string,
          handle: string,
          description: string
        },
        cost: {
          amountPerQuantity: Money
        },
        id: string,
        quantity: number
      }>
    }
}

async function createCheckout(): Promise<Checkout> {
  // Tell the backend to create a checkout and return the ID
  let response = await fetch(`${BACKEND_URL}/create_checkout`, {  method: 'GET' });
  console.log(response);
  let data = await response.json();
  if (data.error) {
      console.error(data.error);
  }
  return data;
}

function cleanID(id: string): string {
  return id.replace("gid://shopify/Cart/", "");//.split("?")[0];
}

function MerchPage() {

    // Initialize the cart
    const [checkoutURL, setCheckoutURL] = React.useState<string>("");
    const [cartItems, setCartItems] = React.useState<Array<CartItemResult>>([]);
    const [checkoutID, setCheckoutID] = React.useState<string>("");

    React.useEffect(() => {
      // Get the checkout ID from local storage
      let localID = localStorage.getItem("nnmcheckoutID");
      if (localID === null) {
        localID = "";
      }
      setCheckoutID(cleanID(localID));
      console.log(cleanID(localID));
      if (cleanID(localID) == '') {
          // If the checkout ID is not in local storage, create a new checkout
          createCheckout().then((checkout) => {
              // Strip ID prefix before saving
              let stripped = cleanID(checkout.id);
              setCheckoutID(stripped);
              setCheckoutURL(checkout.checkoutUrl);
              localStorage.setItem("nnmcheckoutID", stripped);
          });
      } else {
          // Fetch the checkout data
          let retval = fetch(`${BACKEND_URL}/checkout/${cleanID(localID)}`, { method: 'GET' });
          retval.then((response) => {
              if (!response.ok) {
                // Make a new one
                createCheckout().then((checkout) => {
                    let stripped = cleanID(checkout.id);
                    setCheckoutID(stripped);
                    setCheckoutURL(checkout.checkoutUrl);
                    localStorage.setItem("nnmcheckoutID", stripped);
                });
              } else {
                response.json().then((data) => {
                  sync_cart(data);
                });
              }
          });
      }
    }, []);

    // Use the graphql query to get the merch data
    const response = useStaticQuery(pageQuery);
    const merchData = response.allShopifyProduct.edges;

    async function initiate_checkout() {
      window.location.href = checkoutURL;
    }

    async function sync_cart(cartdef: Checkout) {
      cartdef.id = cleanID(cartdef.id);
      // cartdef is possibly out of date, so we need to update the cart
      let retval = await fetch(`${BACKEND_URL}/checkout/${cartdef.id}`, { method: 'GET' });
      let retjson = await retval.json();
      console.log(retjson);
      cartdef = retjson;

      setCheckoutID(cartdef.id);
      localStorage.setItem("nnmcheckoutID", cartdef.id);

      setCheckoutURL(cartdef.checkoutUrl);
      // Empty the cart so we can refill it
      setCartItems((_cartItems) => {
        let newItems = [];
        for (let cartline of cartdef.lines.nodes) {
          console.log(cartline);
          console.log(merchData);
          if (cartline.quantity <= 0) { continue; }
          let merchline = merchData.find((m: any) => m.node.variants[0].shopifyId == cartline.merchandise.id);
          if (!merchline) { continue; }
          newItems.push({
            product_id: cartline.merchandise.id,
            title: merchline.node.title,
            handle: merchline.node.handle,
            description: merchline.node.description,
            currency: cartline.cost.amountPerQuantity.currencyCode,
            price: Number(cartline.cost.amountPerQuantity.amount),
            line_id: cartline.id,
            quantity: cartline.quantity
          });
        }
        console.log(newItems);
        return newItems;
      });
    }

    async function update_external_cart() {
      let payload = {
        items: cartItems
      };

      let retval = await fetch(`${BACKEND_URL}/add_item/${cleanID(checkoutID)}`, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
      let retjson = await retval.json();
      await sync_cart(retjson);
    }

    async function add_item_to_cart(item: ItemResult): Promise<void> {
      let existingItem = cartItems.find(i => i.product_id == item.product_id);
      if (existingItem != null) {
        existingItem.quantity += item.quantity;
      } else {
        cartItems.push({
          line_id: "",
          product_id: item.product_id,
          title: item.title,
          handle: item.handle,
          description: item.description,
          currency: item.currency,
          price: item.price,
          quantity: item.quantity
        });
      }
      await update_external_cart();
    }

    async function remove_item_from_cart(item: ItemResult): Promise<void> {
      let existingItem = cartItems.find(i => i.product_id == item.product_id);
      if (existingItem != null) {
        existingItem.quantity -= item.quantity;
        if (existingItem.quantity <= 0) {
          setCartItems(cartItems.filter(i => i.product_id != item.product_id));
        }
      }
      await update_external_cart();
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
                              nodeID={id} 
                              handle={handle} 
                              shopifyID={variants[0].shopifyId} 
                              title={title} 
                              description={description} 
                              img_src={img_src} 
                              price={price} 
                              currency={priceRangeV2.minVariantPrice.currencyCode}
                            />
                            <button
                                  onClick={async () => {
                                    await add_item_to_cart(item)
                                }}
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={async () => {
                                  await remove_item_from_cart(item);
                                }}
                                disabled={cartItems.every(i => i.product_id != variants[0].shopifyId)}
                                style={{"display": `${cartItems.some(i => i.product_id == variants[0].shopifyId) ? 'block' : 'none'}`}}
                            >
                                Remove from Cart
                            </button> 
                          </div>
                        );
                    })
                }
                </div>
                <div className='cart-summary' style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9', marginTop: '20px' }}>
                  <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', color: "#222831" }}>Cart Summary</h2>
                  <ul style={{ listStyleType: 'none', padding: '0', color: '#222831' }}>
                    {cartItems.map((item) => (
                      <li key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #ddd' }}>
                        <span>{item.title}</span>
                        <span>{item.quantity} x ${item.price} {item.currency}</span>
                        <span style={{ fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)} {item.currency}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={initiate_checkout} 
                    style={{ 
                      marginTop: '20px', 
                      padding: '10px 20px', 
                      backgroundColor: '#007bff', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}
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
