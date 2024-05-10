# Fragments

This is the semester project for DPS955: Cloud Computing for Programmers (AWS)

## Fragments API

### Overview

This repository contains the backend API for the Fragments project. 

### Prerequisites to Clone

- Node.js (v20.13.0)
- git
- VSCode & extensions:
    - ESLint
    - Prettier - Code Formatter
    - Code Spell Checker

### Setting Up

Clone the repository:
    
    git clone git+https://github.com/armenmerzaian/fragments.git
    cd fragments
    

Install the dependencies:

    npm install

## Environment Variables
Available environment variables are:
- `PORT`: The port number where the the server will run. Default is 8080.

    Usage: 

        npm start PORT=8080

        npm run dev PORT=8080

- `LOG_LEVEL`: Sets the level of the logger outputs. Default is `info`, but can be set to `debug` for more detailed logging.
    Usage:
    
        LOG_LEVEL=debug npm run dev

## Available Scripts
In the project directory, you can run:

- `npm start`: Starts the server on the default configured port (8080). Use this for production.
- `npm run dev`: Runs the server in development mode with nodemon, which will reload the server automatically on save. This is set to run with a `info` log level by default but can be changed to `debug` level.
- `npm run debug`: Runs the server in debug mode. Used when connecting to debugger in the IDE. Set to `debug` log level.
- `npm run lint`: Lints the code for potential errors.

