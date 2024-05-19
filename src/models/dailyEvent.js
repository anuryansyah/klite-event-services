const mongoose = require('mongoose');

const dailyEventSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  announcer: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  // announcer: {
  //   type: [mongoose.SchemaTypes.ObjectId],
  //   required: true
  // },
  day: {
    type: String,
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

module.exports = mongoose.model('DailyEvent', dailyEventSchema, '_dailyEvents')