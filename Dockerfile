################################################################################
# Stage 0: Base
################################################################################
FROM node:20.14-alpine3.20@sha256:804aa6a6476a7e2a5df8db28804aa6c1c97904eefb01deed5d6af24bb51d0c81 AS base

LABEL maintainer="Armen Merzaian <amerzanian@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Set the NODE_ENV to production
ENV NODE_ENV production

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package.json package-lock.json /app/

# Install node dependencies defined in package-lock.json
RUN npm ci --only=production

################################################################################
# Stage 1: Build
################################################################################
FROM base AS build

# Copy the rest of the source code
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# Future build steps can be added here:
# - Linting
# - Testing


################################################################################
# Stage 2: Deployment
################################################################################
FROM node:20.14-alpine3.20@sha256:804aa6a6476a7e2a5df8db28804aa6c1c97904eefb01deed5d6af24bb51d0c81 AS deploy

# Use /app as our working directory
WORKDIR /app

# Copy the built files from the build stage
COPY --from=build /app /app

# Install production dependencies (optional, if not already done in the base stage)
COPY package.json package-lock.json /app/
RUN npm install --only=production

# Start the container by running our server
CMD ["npm", "start"]

# We run our service on port 8080
EXPOSE 8080

# Add a healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:$PORT/ || exit 1
