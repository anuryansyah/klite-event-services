const { UserModel, RoleModel } = require("../models");
const bcrypt = require("bcryptjs");

exports.getProfile = async (session) => {
  const user = await UserModel.findOne({ _id: session.id }).populate('roleId').lean();

  user.id = user._id;
  user.role = user.roleId.roleDesc
  delete user.password;
  delete user._id;
  delete user.roleId;

  return user;
};

exports.getMenuAccess = async (session) => {
  const role = await RoleModel.findOne({ _id: session.roleId }).lean();
  if (role) {
    return role.menuAccess
  }
};

exports.create = async (payload) => {
  const { username, fullname, phoneNumber, password, roleId } = payload;

  const user = await UserModel.find({ $or: [{ phoneNumber }, { username }] });

  if (user.length >= 1) {
    const error = new Error(`Email atau No. Handphone sudah terdaftar!`);
    error.httpCode = 400;

    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new UserModel({ 
    username, 
    fullname, 
    phoneNumber, 
    roleId: roleId, 
    password: hashedPassword 
  });
  newUser.save();

  return {
    status: true,
    message: "Pengguna Baru Berhasil Dibuat.",
  };
}

exports.update = async (payload, session) => {
  const { fullname, phoneNumber, username } = payload;

  const user = await UserModel.find({ $or: [{ phoneNumber }, { username }], _id: { $nin: [session.id] } }).lean();

  if (user.length >= 1) {
    const error = new Error('Email atau No. Handphone sudah terdaftar di Pengguna lain!');
    error.httpCode = 404;

    throw error;
  } else{
    const update = {
      $set: {
        username,
        fullname,
        phoneNumber
      }
    }

    await UserModel.updateOne({ _id: session.id }, update);
    const response = {
      status : true,
      message: "Profil Berhasil Diperbarui"
    }
    return response;
  }
}

exports.updatePassword = async (payload, session) => {
  const { password, newPassword } = payload;
  const salt = await bcrypt.genSalt(10);

  const user = await UserModel.findOne({ _id: session.id }).lean();

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (isPasswordCorrect) {
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const update = {
      $set: {
        password: hashedPassword
      }
    }
  
    await UserModel.updateOne({ _id: session.id }, update);
    
    const response = {
      status : true,
      message: "Password Berhasil Diperbarui"
    }
    return response;
  } else {
    const error = new Error('Password Salah!');
    error.httpCode = 400;

    throw error;
  }
}
