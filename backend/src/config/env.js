require('dotenv').config();

const env = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

module.exports = env;
