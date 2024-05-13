const mongoose = require('mongoose');

const roleAccessSchema = mongoose.Schema({
  roleName: {
    type: String,
    required: true
  },
  roleDesc: {
    type: String,
  },
  menuAccess: {
    type: [Object],
  },
  createDate: {
    type: Date,
    default: Date.now
  },
})

module.exports = mongoose.model('RoleAccess', roleAccessSchema, '_roleAccess')