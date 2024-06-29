const { DEFAULT_PASSWORD } = require("../constant");
const { UserModel, RoleModel, DailyEventModel } = require("../models");
const bcrypt = require("bcryptjs");
const { timeCheckUtils } = require("../utils");

exports.getList = async (params) => {
  const { page, limit, keywords, day } = params;

  const filter = {
    isDelete: false,
  };

  if (keywords) {
    filter.$or = [
      { title: new RegExp(keywords, "i") },
      { desc: new RegExp(keywords, "i") }
    ];
  }

  if (day) {
    filter.day = day;
  }

  const events = await DailyEventModel.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate("announcer")
    .populate("createBy")
    .populate("updateBy")
    .sort({ createDate: 'desc' })
    .lean();

  const countTotal = await DailyEventModel.countDocuments(filter);
  const eventData = [];

  events.map((data) => {
    eventData.push({
      id: data._id,
      title: data.title,
      desc: data.desc,
      day: data.day,
      startHour: data.startHour,
      endHour: data.endHour,
      announcer: data.announcer.map(a => a.fullname).join(', '),
      createDate: data.createDate,
      createBy: data.createBy.fullname,
      updateDate: data.updateDate || '',
      updateBy: data.updateBy?.fullname || '',
    });
  });

  const response = {
    data: eventData,
    totalRow: countTotal,
    totalPage: Math.ceil(countTotal / limit)
  };

  return response;
}

exports.getDetail = async (_id) => {
  const event = await DailyEventModel.findOne({ _id })
    .populate('announcer')
    .populate("createBy")
    .populate("updateBy")
    .lean();

  if (event) {
    const data = {
      id: event._id,
      title: event.title,
      desc: event.desc,
      announcer: event.announcer.map(d => {
        return {
          id: d._id,
          fullname: d.fullname,
        }
      }),
      day: event.day,
      startHour: event.startHour,
      endHour: event.endHour,
      createDate: event.createDate,
      createBy: event.createBy.fullname,
      updateDate: event.updateDate || '',
      updateBy: event.updateBy?.fullname || '',
    }

    return {
      status: true,
      data
    }
  }

  const error = new Error('Acara Tidak Ditemukan');
  error.httpCode = 404;

  throw error;
}

exports.create = async (payload, session) => {
  const { title, desc, announcer, day, startHour, endHour } = payload;

  const newEvent = new DailyEventModel({
    title,
    desc,
    announcer,
    day,
    startHour,
    endHour,
    createBy: session.id
  })

  const isConflicting = await timeCheckUtils.checkDailyConflict(day, startHour, endHour, newEvent._id);

  if (isConflicting) {
    const conflictError = new Error('Waktu acara bertabrakan dengan acara yang sudah ada.');
    conflictError.httpCode = 400;
    throw conflictError;
  }

  await newEvent.save();

  return {
    status: true,
    message: 'Acara telah berhasil dibuat.'
  }
}

exports.update = async (_id, payload, session) => {
  const { title, desc, announcer, day, startHour, endHour } = payload;

  const event = await DailyEventModel.findOne({ _id }).lean();

  if (event) {
    const isConflicting = await timeCheckUtils.checkDailyConflict(day, startHour, endHour, event._id);

    if (isConflicting) {
      const conflictError = new Error('Waktu acara bertabrakan dengan acara yang sudah ada.');
      conflictError.httpCode = 400;
      throw conflictError;
    }

    const update = {
      $set: {
        title,
        desc,
        announcer,
        day,
        startHour,
        endHour,
        updateDate: new Date(),
        updateBy: session.id
      }
    }
  
    await DailyEventModel.updateOne({ _id }, update);
      const response = {
        status : true,
        message: "Acara Berhasil Diperbarui"
      }
    return response;
  }

  const error = new Error('Acara Tidak Ditemukan');
  error.httpCode = 404;

  throw error;
}

exports.delete = async (_id, session) => {
  const event = await DailyEventModel.findOne({ _id }).lean();

  if (event) {
    const update = {
      $set: {
        isDelete: true,
        updateDate: new Date(),
        updateBy: session.id
      }
    }
  
    await DailyEventModel.updateOne({ _id }, update);
      const response = {
        status : true,
        message: "Acara Berhasil Dihapus"
      }
    return response;
  }

  const error = new Error('Acara Tidak Ditemukan');
  error.httpCode = 404;

  throw error;
}
