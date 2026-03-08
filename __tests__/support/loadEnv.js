const path = require('path');
const dotenv = require('dotenv');

/**
 * Loads environment variables from `__tests__/.env` into `process.env`.
 * Must be called before any test that depends on AWS credentials or configuration.
 */
module.exports = () => {
  dotenv.config({path: path.join(__dirname, '../.env')});
};
