const dotenv = require('dotenv');

dotenv.config();

const config = {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  SECRET_KEY: process.env.SECRET_KEY,
};

module.exports = config;
