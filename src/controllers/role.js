const { RoleModel } = require("../models");

exports.getList = async () => {
  const role = await RoleModel.find().lean();

  const data = role.map(d => {
    return {
      id: d._id,
      roleName: d.roleName,
      roleDesc: d.roleDesc
    }
  })

  return {
    status: true,
    data
  };
};
