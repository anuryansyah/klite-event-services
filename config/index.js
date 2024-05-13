require('dotenv').config();
const bunyan = require('bunyan');

const logger = bunyan.createLogger({name: 'starter_services'});

const config = {
  service: {
    servicePort: parseInt(process.env.SERVICE_PORT),
  },
  db: {
    baseUrl: process.env.DB_BASE_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME
  },
  smtpServer: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT * 1,
    isSecure: (process.env.SMTP_ISSECURE === 'true'),
    auth: {
      user: process.env.SMTP_AUTH_USER,
      password: process.env.SMTP_AUTH_PASSWORD
    },
    defaultSender: process.env.SMTP_DEFAULT_SENDER
  },
  jwt: {
    secret: process.env.TOKEN_SECRET
  },
  logger
}

module.exports = config