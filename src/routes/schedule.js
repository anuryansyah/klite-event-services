const router = require('express').Router();
const { specialEventController, scheduleController } = require('../controllers');
const {
  jwt: {
    validateAuth
  }
} = require('../middlewares')

router.get('/schedule/list', validateAuth, async (req, res) => {
  const { logger } = req.locals;

  try {
    const response = await scheduleController.getList(req.query);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.get('/schedule/detail', validateAuth, async (req, res) => {
  const { logger } = req.locals;
  const { id } = req.query

  try {
    const response = await scheduleController.getDetail(id);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.post('/schedule/create', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;

  try {
    const response = await scheduleController.create(req.body, jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.post('/schedule/send-notification', validateAuth, async (req, res) => {
  const { logger } = req.locals;
  const { date } = req.body;

  try {
    const response = await scheduleController.sendNotification(date);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.put('/schedule/update', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;
  const { id } = req.query;

  try {
    const response = await scheduleController.update(id, req.body, jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.delete('/schedule/delete', validateAuth, async (req, res) => {
  const { logger } = req.locals;
  const { id } = req.query;

  try {
    const response = await scheduleController.delete(id);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.delete('/schedule/reset', validateAuth, async (req, res) => {
  const { logger } = req.locals;
  const { date } = req.query;

  try {
    const response = await scheduleController.reset(date);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

module.exports = router;