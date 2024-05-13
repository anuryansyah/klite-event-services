require('dotenv').config();
const nodemailer = require("nodemailer");

const smtpConnector = (smtpConfig, logger) => {
  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.isSecure, // true for 465, false for other
      requireTLS: true,
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.password,
      },
    });

    logger.info('Connected to: ', smtpConfig.host);

    transporter.defaultSender = smtpConfig.defaultSender;

    return transporter;
  } catch (error) {
    logger(error);
  }

  // const transporter = nodemailer.createTransport({
  //   host: 'smtp-relay.brevo.com',
  //   port: 587,
  //   secure: false, // true for 465, false for other
  //   requireTLS: true,
  //   auth: {
  //     user: 'yansyah.nur1@gmail.com',
  //     pass: 'yVPAztSUjGIEknqv',
  //   },
  // });

  // transporter.verify((error, success) => {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log("Connected to: ", smtpConfig.host);

  //     transporter.defaultSender = smtpConfig.defaultSender;

  //     return transporter;
  //   }
  // });
};

module.exports = smtpConnector;
