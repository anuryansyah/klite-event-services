const { RoleModel, ScheduleModel, SpecialEventModel } = require("../models");
const mongoose = require('mongoose');
const moment = require("moment");

exports.getDashboard = async (session) => {
  const today = moment().format('YYYY-MM-DD') ;

  const role = await RoleModel.findOne({ _id: session.roleId }).lean();
  const isAnnouncer = role.roleName === 'announcer'

  let filter = {
    category: 'Spesial'
  };
  if (isAnnouncer) {
    filter.announcer = new mongoose.Types.ObjectId(session.id);
  }

  const schedule = await ScheduleModel.find({ 
    announcer: new mongoose.Types.ObjectId(session.id),
    date: today
  }).lean()
  const specialEvent = await ScheduleModel.find(filter).lean();

  const specialEventData = specialEvent.map(data => {
    return {
      id: data._id,
      title: data.title,
      start: moment(data.date).format('YYYY-MM-DD'),
      className: "bg-primary-subtle text-primary",
    }
  })

  const scheduleData = schedule.map(data => {
    return {
      title: data.title,
      startHour: data.startHour,
      endHour: data.endHour,
    }
  })

  const response = {
    status: true,
    isAnnouncer: isAnnouncer,
    schedule: scheduleData,
    events: specialEventData
  }

  return response;
};
