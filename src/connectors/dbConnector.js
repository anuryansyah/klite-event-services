const mongoose = require('mongoose');

const dbConnector = async (dbConfig, logger) => {
  const uri = `${dbConfig.baseUrl}/${dbConfig.dbName}?retryWrites=true&w=majority`;
  const options = {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // keepAlive: true,
    // keepAliveInitialDelay: 300000,
    user: dbConfig.user,
    pass: dbConfig.password
  };

  mongoose
  .connect(uri, options)
  .then(
    () => logger.info(`Connected to: ${uri}`),
    (err) => logger.error(err)
  );
};

module.exports = dbConnector;