import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `no nothing magazine`,
    siteUrl: `https://www.yourdomain.tld`
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: [
    "gatsby-plugin-postcss", 
    "gatsby-plugin-image", 
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-shopify",
      options: {
        password: process.env.SHOPIFY_APP_PASSWORD,
        storeUrl: process.env.GATSBY_MYSHOPIFY_URL,
      },
    },
    {
      resolve: `gatsby-omni-font-loader`,
      options: {
        enableListener: true,
        preconnect: [`https://fonts.googleapis.com`, `https://fonts.gstatic.com`],
        web: [
          {
            name: `Shadows Into Light`,
            file: `https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap`,
          },
          {
            name: `Rowdies`,
            file: `https://fonts.googleapis.com/css2?family=Rowdies:wght@300&display=swap`,
          },
          {
            name: `Permanent Marker`,
            file: `https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap`,
          }
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        "icon": "src/images/logo.png"
      }
    },
  ],
};

export default config;
