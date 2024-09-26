import React from 'react';
import { graphql, HeadFC, useStaticQuery } from 'gatsby';

import Layout from '../components/layout';
import SegmentHeader from '../components/segmentheader';
import { Cart, ItemResult } from '../components/cart';
import CartView from '../components/cartview';
import ProductGrid, { MerchNode } from '../components/productgrid';

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

function itemResultFromMerchNode(node: MerchNode): ItemResult {
    return {
        product_id: node.node.id,
        title: node.node.title,
        handle: node.node.handle,
        description: node.node.description,
        price: Number(node.node.priceRangeV2.minVariantPrice.amount),
        currency: node.node.priceRangeV2.minVariantPrice.currencyCode,
        quantity: 1,
    };
}

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

    async function add_item(item: MerchNode) {
      await cart.add_item(itemResultFromMerchNode(item)).then(() => {
        setCart(cart.dupe());
      });
    }

    async function remove_item(item: MerchNode) {
      await cart.remove_item(itemResultFromMerchNode(item)).then(() => {
        setCart(cart.dupe());
      });
    }

    return (
        <Layout>
            <SegmentHeader headerText="Merch" />
            <div className="merch">
                <ProductGrid cart={cart} merchData={merchData} addItemCallback={add_item} removeItemCallback={remove_item} />
                <CartView cart={cart} checkoutFn={initiate_checkout} />
            </div>
        </Layout>
    );
}

export default MerchPage;

export const Head: HeadFC = () => <title>no nothing magazine | merch</title>
