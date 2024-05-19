const router = require('express').Router();
const { dailyEventController } = require('../controllers');
const {
  jwt: {
    validateAuth
  }
} = require('../middlewares')

router.get('/daily-event/list', validateAuth, async (req, res) => {
  const { logger } = req.locals;

  try {
    const response = await dailyEventController.getList(req.query);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.get('/daily-event/detail', validateAuth, async (req, res) => {
  const { logger } = req.locals;
  const { id } = req.query

  try {
    const response = await dailyEventController.getDetail(id);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.post('/daily-event/create', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;

  try {
    const response = await dailyEventController.create(req.body, jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.put('/daily-event/update', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;
  const { id } = req.query;

  try {
    const response = await dailyEventController.update(id, req.body, jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.delete('/daily-event/delete', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;
  const { id } = req.query;

  try {
    const response = await dailyEventController.delete(id, jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

module.exports = router;