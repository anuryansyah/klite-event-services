const router = require('express').Router();
const { roleController } = require('../controllers');
const {
  jwt: {
    validateAuth
  }
} = require('../middlewares')

router.get('/role/list', validateAuth, async (req, res) => {
  const { logger } = req.locals;

  try {
    const response = await roleController.getList();

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

module.exports = router;