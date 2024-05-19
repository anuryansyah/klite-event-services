const authRoute = require('./auth');
const userRoute = require('./user');
const roleRoute = require('./role');
const dailyEventRoute = require('./dailyEvent');

const routes = [
  authRoute,
  userRoute,
  roleRoute,
  dailyEventRoute
]

module.exports = (app) => {
  routes.map(route => app.use(route));
};