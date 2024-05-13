const router = require('express').Router();
const { authController } = require('../controllers');
const {
  authValidation: {
    registerValidation,
    loginValidation
  }
} = require('../middlewares');
const { validateAuth } = require('../middlewares/jwt');

router.post('/auth/register', registerValidation, async (req, res) => {
  const { logger } = req.locals;

  try {
    const response = await authController.register(req.body);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.post('/auth/login', loginValidation, async (req, res) => {
  const { logger } = req.locals;

  try {
    const response = await authController.login(req.body);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.post('/auth/account-verification', validateAuth , async (req, res) => {
  const { logger, jwtPayload, smtpTransporter } = req.locals;

  try {
    const response = await authController.accountVerification(jwtPayload, smtpTransporter);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.post('/auth/account-verification/verify', validateAuth , async (req, res) => {
  const { logger, jwtPayload } = req.locals;

  try {
    const response = await authController.submitAccountVerification(jwtPayload, req.body);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.post('/auth/forgot-password', async (req, res) => {
  const { smtpTransporter } = req.locals;

  try {
    const response = await authController.forgotPassword(req.body, smtpTransporter);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.post('/auth/forgot-password/verify' , async (req, res) => {
  try {
    const response = await authController.submitForgotPassword(req.body);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

module.exports = router;