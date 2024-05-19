const express = require('express');
const morgan = require('morgan');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors')

const config = require('../config');
const { dbConnector } = require('./connectors');
const routes = require('./routes');
const smtpConnector = require('./connectors/smtpConnector');
const { telegramBotUtils } = require('./utils');

const app = express();

const {
  service: { servicePort },
  db: dbConfig,
  smtpServer: smtpConfig,
  logger
} = config;

//Telegram Bot
// telegramBotUtils.listen(logger);

// Initializations
dbConnector(dbConfig, logger);
const smtpTransporter = smtpConnector(smtpConfig, logger);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, _, next) => {
  // put connector, logger, config, etc on req.locals to be access on controller
  req.locals = { logger, config, smtpTransporter };
  next();
});

routes(app);

let server = http.createServer(app);

server.listen(servicePort, () => logger.info(`app running at :${servicePort}`));