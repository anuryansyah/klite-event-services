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

router.get('/user/list', validateAuth, async (req, res) => {
  const { logger } = req.locals;

  try {
    const response = await userController.getList(req.query);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.get('/user/list-announcer', validateAuth, async (req, res) => {
  const { logger } = req.locals;

  try {
    const response = await userController.getListAnnouncer();

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.post('/user/create', validateAuth, async (req, res) => {
  const { logger } = req.locals;

  try {
    const response = await userController.create(req.body);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.put('/user/update', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;

  try {
    const response = await userController.update(req.body, jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.put('/user/change-password', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;

  try {
    const response = await userController.updatePassword(req.body, jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.delete('/user/delete', validateAuth, async (req, res) => {
  const { logger } = req.locals;
  const { id } = req.query;

  try {
    const response = await userController.delete(id);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

module.exports = router;