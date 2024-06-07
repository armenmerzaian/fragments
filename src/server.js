// src/server.js

// We want to gracefully shutdown our server
const stoppable = require('stoppable');

// Get our logger instance
const logger = require('./logger');

// Get our express app instance
const app = require('./app');

// Get the desired port from the process' environment. Default to `8080`
const port = parseInt(process.env.PORT || '8080', 10);

// Start a server listening on this port
const server = stoppable(
  app.listen(port, () => {
    // Log a message that the server has started, and which port it's using.
    logger.info(`Server started on port ${port}`);
    logger.debug('Debug logging enabled');
    //logger.debug({env: process.env}, 'Environment variables');
  })
);

// Gracefully shutdown the server when we receive a signal
const shutdown = (signal) => {
  signal ? logger.debug(`${signal} signal received: closing HTTP server`) 
         : null;
         
  server.close(() => {
    logger.info('Server has stopped.');
  });
};

// Listen for kill signals to stop the server
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);



// Export our server instance so other parts of our code can access it if necessary.
module.exports = server;
