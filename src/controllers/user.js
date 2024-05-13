const { UserModel, RoleAccessModel } = require("../models");

exports.getProfile = async (session) => {
  const user = await UserModel.findOne({ _id: session.id }).populate('roleId').lean();

  user.id = user._id;
  user.role = user.roleId.roleDesc
  delete user.password;
  delete user._id;
  delete user.roleId;

  return user;
};

exports.getRoleAccess = async (session) => {
  const role = await RoleAccessModel.findOne({ _id: session.roleId }).lean();
  if (role) {
    return role.menuAccess
  }
};
