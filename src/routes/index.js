// src/routes/index.js

const express = require('express');
// version and author from package.json
const { version, author } = require('../../package.json');
// Create a router that we can use to mount our API
const router = express.Router();
// Our authentication middleware
const { authenticate } = require('../auth');
// Our response helpers
const { createSuccessResponse } = require('../response');
const logger = require('../logger');
const { hostname } = require('os');

/**
 * Expose all of our API routes on /v1/* to include an API version.
 * And all routes have to be authenticated.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  logger.info('Health check route accessed');
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Send a 200 'OK' response
  res.status(200).json(createSuccessResponse({
    author,
    githubUrl: 'https://github.com/armenmerzaian/fragments',
    version,
    hostname: hostname(),
  }));
});

module.exports = router;
