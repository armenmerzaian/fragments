// src/routes/api/get-by-id.js

const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const id = req.params.id;

  try {
    // Retrieve the fragment by id for the authenticated user
    const fragment = await Fragment.byId(ownerId, id);
    // Get the fragment data
    const data = await fragment.getData();

    // Send the fragment data as plain text
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(data);
  } catch (err) {
    logger.error({ err }, 'Error retrieving fragment');
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
