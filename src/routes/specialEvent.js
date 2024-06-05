const router = require('express').Router();
const { specialEventController } = require('../controllers');
const {
  jwt: {
    validateAuth
  }
} = require('../middlewares')

router.get('/special-event/list', validateAuth, async (req, res) => {
  const { logger } = req.locals;

  try {
    const response = await specialEventController.getList(req.query);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.get('/special-event/detail', validateAuth, async (req, res) => {
  const { logger } = req.locals;
  const { id } = req.query

  try {
    const response = await specialEventController.getDetail(id);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.post('/special-event/create', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;

  try {
    const response = await specialEventController.create(req.body, jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.put('/special-event/update', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;
  const { id } = req.query;

  try {
    const response = await specialEventController.update(id, req.body, jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

router.delete('/special-event/delete', validateAuth, async (req, res) => {
  const { logger, jwtPayload } = req.locals;
  const { id } = req.query;

  try {
    const response = await specialEventController.delete(id, jwtPayload);

    return res.status(200).send(response);
  } catch (error) {
    logger.error(error);

    return res.status(error.httpCode || 500).send({ error: error.message });
  }
})

module.exports = router;