const { ScheduleModel, SpecialEventModel, DailyEventModel } = require("../models");

const checkTimeConflict = async (newStartHour, newEndHour, sameDayEvents) => {
  const timeToMinutes = time => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const newEventStartMinutes = timeToMinutes(newStartHour);
  const newEventEndMinutes = timeToMinutes(newEndHour);

  return sameDayEvents.some(existingEvent => {
    const existingStartMinutes = timeToMinutes(existingEvent.startHour);
    const existingEndMinutes = timeToMinutes(existingEvent.endHour);
    
    return (
      (newEventStartMinutes >= existingStartMinutes && newEventStartMinutes < existingEndMinutes) ||
      (newEventEndMinutes > existingStartMinutes && newEventEndMinutes <= existingEndMinutes) ||
      (newEventStartMinutes <= existingStartMinutes && newEventEndMinutes >= existingEndMinutes) ||
      (newEventStartMinutes <= existingStartMinutes && newEventEndMinutes >= existingEndMinutes)
    );
  });
};

const checkScheduleConflict = async (date, newStartHour, newEndHour, excludeId = null) => {
  const query = { date };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const sameDayEvents = await ScheduleModel.find(query).lean();

  return checkTimeConflict(newStartHour, newEndHour, sameDayEvents)
};

const checkSpecialConflict = async (date, newStartHour, newEndHour, excludeId = null) => {
  const query = { date };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const sameDayEvents = await SpecialEventModel.find(query).lean();

  return checkTimeConflict(newStartHour, newEndHour, sameDayEvents)
};

const checkDailyConflict = async (day, newStartHour, newEndHour, excludeId = null) => {
  const query = { day };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const sameDayEvents = await DailyEventModel.find(query).lean();

  return checkTimeConflict(newStartHour, newEndHour, sameDayEvents)
};

module.exports = { checkScheduleConflict, checkSpecialConflict, checkDailyConflict };