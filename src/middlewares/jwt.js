const jwt = require("jsonwebtoken");

const { jwt: { secret }, } = require("../../config");

const validateAuth = (req, res, next) => {
  const { logger } = req.locals;

  if (!req.header("authorization")) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  const token = req.header('authorization').replace('Bearer ', '');

  try {
    const jwtPayload = jwt.verify(token, secret);

    req.locals.jwtPayload = jwtPayload;
  } catch (error) {
    logger.error(error);
    return res.status(401).send({ message: 'Invalid Token', error: error.message });
  }

  next()
};

module.exports = { validateAuth }
