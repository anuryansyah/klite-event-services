const authRoute = require('./auth');
const userRoute = require('./user');
const roleRoute = require('./role');
const dailyEventRoute = require('./dailyEvent');
const specialEventRoute = require('./specialEvent');

const routes = [
  authRoute,
  userRoute,
  roleRoute,
  dailyEventRoute,
  specialEventRoute
]

module.exports = (app) => {
  routes.map(route => app.use(route));
};