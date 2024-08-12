const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    const id = req.params.id;
    const contentType = req.get('Content-Type');
    const body = req.body;

    // Get the fragment by id
    let fragment = await Fragment.byId(ownerId, id);

    // Check if the Content-Type matches the fragment's type
    if (fragment.type !== contentType) {
      logger.error(`Content-Type mismatch: expected ${fragment.type}, got ${contentType}`);
      return res
        .status(400)
        .json(createErrorResponse(400, `Content-Type mismatch: expected ${fragment.type}, got ${contentType}`)
        );
    }

    // Update the fragment's data, and save it
    await fragment.setData(body);
    await fragment.save();

    logger.info(`Fragment with id ${id} updated successfully`);

    // Send success response with updated metadata
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, 'Error updating fragment');
    if (err.message.includes('Fragment not found')) {
      res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    } else {
      res.status(500).json(createErrorResponse(500, 'Unable to update fragment'));
    }
  }
};
