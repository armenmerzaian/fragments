const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const id = req.params.id;
  try {
    const fragment = await Fragment.byId(ownerId, id);
    logger.info(`Fragment metadata retrieved for id: ${id}`);
    logger.info({ fragment }, 'Fragment metadata retrieved to be deleted');
    
    await Fragment.delete(ownerId, id);
    res.status(200).json(createSuccessResponse());
  } catch (err) {
    logger.error({ err }, `Error deleting fragment metadata, for id: ${id}`);
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
