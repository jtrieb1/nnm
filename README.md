# NNM
no, nothing Magazine is a magazine run by some friends of mine, who've kindly allowed me to display the code for
their website as part of my portfolio.

This website currently consists of two components:

## Frontend
The frontend is written in React, using Gatsby. Gatsby was chosen for ease of integration with Shopify.

## Backend
The backend is written in Rust, using actix-web. This was not the most efficient choice, due to the lack of viable
Shopify SDKs, but I really wanted to write a web server in Rust and didn't mind rolling my own Shopify interface.

# Infrastructure
Currently, the website is hosted on AWS using a handful of ECS instances.

# Visit
You can visit the website at [nonothing.online](https://nonothing.online).