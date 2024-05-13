const bcrypt = require("bcryptjs");
const { UserModel } = require("../models");
const jwt = require("jsonwebtoken");
const { jwt: { secret }, logger } = require('../../config');
const otpGenerator = require('otp-generator');
const { mailSender } = require("../utils");
const { USER_STATUS, USER_ROLE_DEFAULT } = require('../constant');

exports.register = async (payload) => {
  const { username, fullname, phoneNumber, password } = payload;

  const userExist = await UserModel.findOne({ username });

  if (userExist) {
    const error = new Error(`Email ${username} has been registered!`);
    error.httpCode = 409;

    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new UserModel({ 
    username, 
    fullname, 
    phoneNumber, 
    roleId: USER_ROLE_DEFAULT, 
    password: hashedPassword 
  });
  newUser.save();

  return {
    status: true,
    message: "Registration Success.",
  };
};

exports.login = async (payload) => {
  const { username, password } = payload;
  const user = await UserModel.findOne({ username }).lean();
  let error;

  if (user) {
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (isPasswordCorrect) {
      user.id = user._id;

      delete user.password;
      delete user._id;
      delete user.__v;

      return {
        token: jwt.sign(user, secret, { expiresIn: "1 days" }),
        verify: user.status
      };
    }
  }

  error = new Error("Incorrect username or password");
  error.httpCode = 401;

  throw error;
};

exports.accountVerification = async (session, smtpTransporter) => {
  const { id } = session;
  const user = await UserModel.findOne({ _id: id }).lean();
  let info;

  if (user) {
    const securityCode = otpGenerator.generate(6, { upperCaseAlphabets: true, specialChars: false, lowerCaseAlphabets: false });
    
    await UserModel.updateOne({ _id: id }, { $set: { securityCode } });
    
    info = await mailSender.accountVerification(smtpTransporter, user, securityCode);
    
    logger.info('Email sent, message ID', info);
    
    return {
      status: true,
      message: 'Email has been sent.'
    }
  }
  
  const error = new Error('User not found');
  error.httpCode = 404;

  throw error;
};

exports.submitAccountVerification = async (session, payload) => {
  const { securityCode, newPassword } = payload;
  const { id } = session;
  let query;
  let message;

  const user = await UserModel.findOne({ _id: id }).lean();

  if (securityCode === user.securityCode) {
    if (user.status === USER_STATUS.NEW) {
      query = { securityCode: '', status: USER_STATUS.ACTIVE }
      message = 'Account has been verified.';
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      query = { securityCode: '', status: USER_STATUS.ACTIVE, password: hashedPassword }
      message = 'The password has been changed successfully.'
    }

    await UserModel.updateOne({ _id: id }, { $set: query });

    return {
      status: true,
      message: message
    };
  }

  const error = new Error('OTP is invalid. Please enter correct password.');
  error.httpCode = 403;

  throw error;
};

exports.forgotPassword = async (payload, smtpTransporter) => {
  const { username } = payload;
  const user = await UserModel.findOne({ username }).lean();
  let info;

  if (user) {
    const securityCode = otpGenerator.generate(6, { upperCaseAlphabets: true, specialChars: false, lowerCaseAlphabets: false });
    
    await UserModel.updateOne({ _id: user._id }, { $set: { securityCode } });
    
    info = await mailSender.forgotPassword(smtpTransporter, user, securityCode);
    
    logger.info('Email sent, message ID', info);
    
    return {
      status: true,
      message: 'Email has been sent.'
    }
  }
  
  const error = new Error('User not found');
  error.httpCode = 404;

  throw error;
}

exports.submitForgotPassword = async (payload) => {
  const { securityCode, password, username } = payload;
  let query;
  let message;

  const user = await UserModel.findOne({ username }).lean();

  if (securityCode === user.securityCode) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    query = { securityCode: '', status: USER_STATUS.ACTIVE, password: hashedPassword }
    message = 'The password has been changed successfully.'

    await UserModel.updateOne({ _id: user._id }, { $set: query });

    return {
      status: true,
      message: message
    };
  }

  const error = new Error('OTP is invalid. Please enter correct password.');
  error.httpCode = 403;

  throw error;
};