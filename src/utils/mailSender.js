const path = require('path');
const ejs = require('ejs');
const { REGISTRATION_VERIFY, FORGOT_PASSWORD } = require('../constant');

const templateEmail = path.join(__dirname, '../views/email/index.ejs')

const accountVerification = async (smtpTransporter, user, securityCode) => {
  const data = await ejs.renderFile(templateEmail, {
    data: {
      fullname: user.fullname,
      title: REGISTRATION_VERIFY.TITLE,
      message: REGISTRATION_VERIFY.MESSAGE,
      otp: securityCode
    }
  })
  
  const info = await smtpTransporter.sendMail({
    from: smtpTransporter.defaultSender,
    to: user.username,
    subject: REGISTRATION_VERIFY.TITLE,
    html: data
  })

  return info
};

const forgotPassword = async (smtpTransporter, user, securityCode) => {
  const data = await ejs.renderFile(templateEmail, {
    data: {
      fullname: user.fullname,
      title: FORGOT_PASSWORD.TITLE,
      message: FORGOT_PASSWORD.MESSAGE,
      otp: securityCode
    }
  })
  
  const info = await smtpTransporter.sendMail({
    from: smtpTransporter.defaultSender,
    to: user.username,
    subject: FORGOT_PASSWORD.TITLE,
    html: data
  })

  return info
};


module.exports = { accountVerification, forgotPassword };