const { RoleModel } = require("../models");

exports.getList = async () => {
  const role = await RoleModel.find().lean();

  return role;
};
