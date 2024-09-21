# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.0.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=cache,target=/root/.npm \
    npm i

# Install gatsby-cli
RUN npm install -g gatsby-cli

# Copy the rest of the source files into the image.
COPY . .

# Build the application.
RUN --mount=type=secret,id=GATSBY_MYSHOPIFY_URL,env=GATSBY_MYSHOPIFY_URL \
    --mount=type=secret,id=SHOPIFY_APP_PASSWORD,env=SHOPIFY_APP_PASSWORD \
    npm run build

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 2000

# Tell Docker how to run your application.
CMD ["npm", "run", "serve", "--", "-p", "2000", "-H", "0.0.0.0"]    