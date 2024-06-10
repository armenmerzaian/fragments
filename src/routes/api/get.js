// src/routes/api/get.js

const { createSuccessResponse, createErrorResponse } = require("../../response");
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  logger.info('GET /v1/fragments called')
  try {
    const userId = req.user; // Authenticated user's ID
    const fragments = await Fragment.byUser(userId);
    
    logger.info(`Returning ${fragments.length} fragments for user ${userId}`);
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    logger.error({ err }, 'Error retrieving fragments');
    res.status(500).json(createErrorResponse(500, 'Unable to retrieve fragments'));
  }
};
