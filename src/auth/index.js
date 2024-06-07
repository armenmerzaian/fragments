// src/auth/index.js

const logger = require('../logger');

// Prefer Amazon Cognito
if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
  logger.debug('Using Amazon Cognito for authentication')
  module.exports = require('./cognito');
}
// Also allow for an .htpasswd file to be used, but not in production
else if (process.env.HTPASSWD_FILE && process.NODE_ENV !== 'production') {
  logger.debug('Using .htpasswd file for basic authentication')
  module.exports = require('./basic-auth');
}
// In all other cases, we need to stop now and fix our config
else {
  logger.error('No authorization configuration found. Please set AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID, or HTPASSWD_FILE');
  throw new Error('missing env vars: no authorization configuration found');
}
