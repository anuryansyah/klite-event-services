const router = require('express').Router();
const { userController } = require('../controllers');
const {
  jwt: {
    validateAuth
  }
} = require('../middlewares')

router.get('/user/profile', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;

  try {
    const response = await userController.getProfile(jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.get('/user/menu-access', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;

  try {
    const response = await userController.getMenuAccess(jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

module.exports = router;