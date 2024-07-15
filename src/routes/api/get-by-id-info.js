// src/routes/api/get-by-id-info.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const id = req.params.id;

  try {
    // Retrieve the fragment by id for the authenticated user
    const fragment = await Fragment.byId(ownerId, id);

    // If fragment is found, return metadata
    logger.info(`Fragment metadata retrieved for id: ${id}`);
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, `Error retrieving fragment metadata for id: ${id}`);
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
