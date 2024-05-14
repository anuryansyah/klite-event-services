const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
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

module.exports = mongoose.model('Roles', roleSchema, '_roles')