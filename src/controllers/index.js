const authController = require("./auth");
const userController = require("./user");
const roleController = require("./role");
const dailyEventController = require("./dailyEvent");
const specialEventController = require("./specialEvent");

module.exports = {
  authController,
  userController,
  roleController,
  dailyEventController,
  specialEventController
};
