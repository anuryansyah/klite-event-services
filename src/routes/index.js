const authRoute = require('./auth');
const userRoute = require('./user');
const roleRoute = require('./role');

const routes = [
  authRoute,
  userRoute,
  roleRoute
]

module.exports = (app) => {
  routes.map(route => app.use(route));
};