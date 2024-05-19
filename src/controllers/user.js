const { DEFAULT_PASSWORD } = require("../constant");
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

exports.getList = async (params) => {
  const { page, limit, keywords } = params;

  const filter = {
    isDelete: false,
  };

  if (keywords) {
    filter.$or = [
      { fullname: new RegExp(keywords, "i") },
      { username: new RegExp(keywords, "i") }
    ];
  }

  const users = await UserModel.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate("roleId")
    .sort({ createDate: 'desc' })
    .lean();

  const countTotal = await UserModel.countDocuments(filter);
  const userData = [];

  users.map((data) => {
    userData.push({
      id: data._id,
      username: data.username,
      fullname: data.fullname,
      phoneNumber: data.phoneNumber,
      role: {
        id: data.roleId._id,
        roleName: data.roleId.roleName,
        roleDesc: data.roleId.roleDesc,
      },
      notification: data.telegramId ? true : false,
      status: data.status,
      createDate: data.createDate,
    });
  });

  const response = {
    data: userData,
    totalRow: countTotal,
    totalPage: Math.ceil(countTotal / limit)
  };

  return response;
}

exports.getListAnnouncer = async () => {
  const role = await RoleModel.findOne({ roleName: 'announcer' }).lean();
  const users = await UserModel.find({ roleId: role._id }).lean();
  const data = [];

  users.map(user => {
    data.push({
      id: user._id,
      fullname: user.fullname,
    })
  })

  return data;
}

exports.create = async (payload) => {
  const { username, fullname, phoneNumber, roleId } = payload;

  const user = await UserModel.find({ $or: [{ phoneNumber }, { username }] });

  if (user.length >= 1) {
    const error = new Error(`Email atau No. Handphone sudah terdaftar!`);
    error.httpCode = 400;

    throw error;
  }
  
  const password = DEFAULT_PASSWORD;

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

  console.log(payload);

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
