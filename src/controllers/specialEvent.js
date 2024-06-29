const { SpecialEventModel } = require("../models");
const { timeCheckUtils } = require("../utils");

exports.getList = async (params) => {
  const { page, limit, keywords, startDate, endDate } = params;

  const filter = {
    isDelete: false,
  };

  if (keywords) {
    filter.$or = [
      { title: new RegExp(keywords, "i") },
      { desc: new RegExp(keywords, "i") }
    ];
  }

  if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate).setHours(23, 59, 59, 999) };
  } else if (startDate) {
    filter.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    filter.date = { $lte: new Date(endDate).setHours(23, 59, 59, 999) };
  }

  const events = await SpecialEventModel.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate("announcer")
    .populate("createBy")
    .populate("updateBy")
    .sort({ createDate: 'desc' })
    .lean();

  const countTotal = await SpecialEventModel.countDocuments(filter);
  const eventData = [];

  events.map((data) => {
    eventData.push({
      id: data._id,
      title: data.title,
      desc: data.desc,
      date: data.date,
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
  const event = await SpecialEventModel.findOne({ _id })
    .populate('announcer')
    .populate("createBy")
    .populate("updateBy")
    .lean();

  if (event) {
    const data = {
      id: event._id,
      title: event.title,
      desc: event.desc,
      date: event.date,
      announcer: event.announcer.map(d => {
        return {
          id: d._id,
          fullname: d.fullname,
        }
      }),
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
  const { title, desc, announcer, date, startHour, endHour } = payload;

  const newEvent = new SpecialEventModel({
    title,
    desc,
    announcer,
    date: new Date(date),
    startHour,
    endHour,
    createBy: session.id
  })

  const isConflicting = await timeCheckUtils.checkSpecialConflict(date, startHour, endHour, newEvent._id);

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
  const { title, desc, announcer, date, startHour, endHour } = payload;

  const event = await SpecialEventModel.findOne({ _id }).lean();

  if (event) {
    const isConflicting = await timeCheckUtils.checkSpecialConflict(date, startHour, endHour, event._id);

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
        date: new Date(date),
        startHour,
        endHour,
        updateDate: new Date(),
        updateBy: session.id
      }
    }
  
    await SpecialEventModel.updateOne({ _id }, update);
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
  const event = await SpecialEventModel.findOne({ _id }).lean();

  if (event) {
    const update = {
      $set: {
        isDelete: true,
        updateDate: new Date(),
        updateBy: session.id
      }
    }
  
    await SpecialEventModel.updateOne({ _id }, update);
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
