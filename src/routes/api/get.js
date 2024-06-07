// src/routes/api/get.js

const { createSuccessResponse } = require("../../response");

const logger = require('../../logger');

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  logger.info('GET /v1/fragments called')
  res.status(200).json(createSuccessResponse({
    fragments: [],
  }));
};
