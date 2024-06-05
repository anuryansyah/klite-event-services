const mongoose = require('mongoose');

const scheduleSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
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

module.exports = mongoose.model('Schedule', scheduleSchema, '_schedule')