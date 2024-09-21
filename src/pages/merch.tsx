import React from 'react';

import Layout from '../components/layout';
import SegmentHeader from '../components/segmentheader';
import ProductCard from '../components/productcard';
import { graphql, useStaticQuery } from 'gatsby';
import { getImage } from 'gatsby-plugin-image';

import Cart from '../components/cart';
import CartView from '../components/cartview';

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

// Set up a cart context
export const CartContext = React.createContext(new Cart());

function MerchPage() {

    // Initialize the cart
    const [cart, setCart] = React.useState(new Cart());

    React.useEffect(() => {
        cart.init();
    }, []);

    // Use the graphql query to get the merch data
    const response = useStaticQuery(pageQuery);
    const merchData = response.allShopifyProduct.edges;

    return (
      <CartContext.Provider value={cart}>
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
                        return (
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
                              cartUpdater={setCart}
                            />
                        );
                    })
                }
                </div>
                <div className='cart-summary'>
                  { cart == null ? <p>Loading Cart...</p> :  <CartView />}
                </div>
            </div>
        </Layout>
        </CartContext.Provider>
    );
}

export default MerchPage;
