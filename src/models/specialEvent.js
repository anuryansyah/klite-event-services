const mongoose = require('mongoose');

const specialEventSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: ''
  },
  announcer: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  date: {
    type: Date,
    required: true
  },
  startHour: {
    type: String,
    required: true
  },
  endHour: {
    type: String,
    required: true
  },
  isDelete: {
    type: Boolean,
    default: false
  },
  createDate: {
    type: Date,
    default: Date.now
  },
  createBy: {
    type: mongoose.SchemaTypes.ObjectId, ref: 'User'
  },
  updateDate: {
    type: Date
  },
  updateBy: {
    type: mongoose.SchemaTypes.ObjectId, ref: 'User'
  }
})

module.exports = mongoose.model('SpecialEvent', specialEventSchema, '_specialEvents')