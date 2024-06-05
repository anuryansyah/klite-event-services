const router = require('express').Router();
const { dashboardController } = require('../controllers');
const {
  jwt: {
    validateAuth
  }
} = require('../middlewares')

router.get('/dashboard', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;

  try {
    const response = await dashboardController.getDashboard(jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

module.exports = router;