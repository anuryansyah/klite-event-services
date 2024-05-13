const joi = require("joi");

const registerValidation = (req, res, next) => {
  const { logger } = req.locals;
  const schema = joi.object().keys({
    username: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    fullname: joi.string().required(),
    phoneNumber: joi.string().required(),
    password: joi.string().required(),
  });

  const validateCheck = schema.validate(req.body);

  if (validateCheck.error) {
    logger.error(validateCheck);

    return res.status(400).send({ error: validateCheck.error });
  }

  next();
};

const loginValidation = (req, res, next) => {
  const { logger } = req.locals;
  const schema = joi.object().keys({
    username: joi.string().required(),
    password: joi.string().required(),
  });

  const validateCheck = schema.validate(req.body);

  if (validateCheck.error) {
    logger.error(validateCheck);

    return res.status(400).send({ error: validateCheck.error });
  }

  next();
};

module.exports = {
  registerValidation,
  loginValidation
};
