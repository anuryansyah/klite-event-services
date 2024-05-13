const mongoose = require('mongoose');
const { USER_STATUS } = require('../constant');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  fullname: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  roleId: {
    type: mongoose.SchemaTypes.ObjectId, ref: 'RoleAccess'
  },
  telegramId: {
    type: String,
    default: ''
  },
  status: {
    type: Number,
    default: USER_STATUS.NEW
  },
  securityCode: {
    type: String,
    default: ''
  },
  isDelete: {
    type: Boolean,
    default: false
  },
  createDate: {
    type: Date,
    default: Date.now
  },
  updateDate: {
    type: Date
  }
})

module.exports = mongoose.model('User', userSchema, '_users')