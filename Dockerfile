# This is a Dockerfile
# Use node version 18.13.0
FROM node:20.13.0

##
# Metadata about the project
##
LABEL maintainer="Armen Merzaian <amerzanian@myseneca.ca>"
LABEL description="Fragments node.js microservice"

##
# Environment variables
##
# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

##
# Working Directory
##
# Use /app as our working directory
WORKDIR /app

##
# Copying Dependency Files
##
# Option 3: explicit filenames - Copy the package.json and package-lock.json
# files into the working dir (/app), using full paths and multiple source
# files.  All of the files will be copied into the working dir `./app`
COPY package.json package-lock.json /app/

##
# Install Dependencies
##
# Install node dependencies defined in package-lock.json
RUN npm install

##
# Copying Source Code
##
# Copy src to /app/src/
COPY ./src ./src
# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd


# Start the container by running our server
CMD npm start

# We run our service on port 8080
EXPOSE 8080
