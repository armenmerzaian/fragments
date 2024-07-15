// src/routes/api/get-by-id.js

const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');
const mime = require('mime-types');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const id = path.basename(req.params.id, path.extname(req.params.id));
  const ext = path.extname(req.params.id);

  try {
    // Retrieve the fragment by id for the authenticated user
    const fragment = await Fragment.byId(ownerId, id);
    // Get the fragment data
    const data = await fragment.getData();

    if (ext) {
      try {
        const conversion = await fragment.convertTo(data, ext);
        res.setHeader('Content-Type', mime.lookup(ext) || conversion.type);
        res.status(200).send(conversion.data);
      } catch (error) {
        logger.error({ error }, 'Error converting fragment');
        res.status(415).json(createErrorResponse(415, 'Unsupported conversion type'));
      }
    } else {
      res.setHeader('Content-Type', fragment.type);
      res.status(200).send(data);
    }
  } catch (err) {
    logger.error({ err }, 'Error retrieving fragment');
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
