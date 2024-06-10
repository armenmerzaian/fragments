const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  
  const ownerId = req.user;
  const type = req.get('Content-Type');
  const body = req.body;

  //Make sure incoming data is correct format
  //this might be unnecessary due to the check in ./index.js
  if (!Fragment.isSupportedType(type)){
    logger.error(`Unsupported media type: ${type}`);
    return res.status(415).json(createErrorResponse(415, `Unsupported media type: ${type}`));
  }
  
  const fragment = new Fragment({ ownerId, type });
  await fragment.save();
  await fragment.setData(body);

  const apiBaseUrl = req.headers.host || process.env.API_URL;
  const apiFullUrl = `${apiBaseUrl}/v1/fragments/${fragment.id}`;
  logger.debug({apiFullUrl}, "Sending success response")
  res.setHeader('Location', apiFullUrl);
  res.status(201).json(createSuccessResponse({ fragment: fragment }));
};
