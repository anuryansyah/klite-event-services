const authController = require("./auth");
const userController = require("./user");
const roleController = require("./role");
const dailyEventController = require("./dailyEvent");
const specialEventController = require("./specialEvent");
const scheduleController = require("./schedule");
const dashboardController = require("./dashboard");

module.exports = {
  authController,
  userController,
  roleController,
  dailyEventController,
  specialEventController,
  scheduleController,
  dashboardController
};
