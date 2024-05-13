const authRoute = require('./auth');
const userRoute = require('./user');

const routes = [
  authRoute,
  userRoute
]

module.exports = (app) => {
  routes.map(route => app.use(route));
};