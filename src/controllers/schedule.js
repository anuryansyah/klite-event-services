const moment = require("moment");
const { DailyEventModel, SpecialEventModel, ScheduleModel, RoleModel } = require("../models");
const { telegramBotUtils, timeCheckUtils } = require("../utils");

moment.locale('id')

exports.getList = async (params) => {
  const { date } = params;
  const eventData = [];

  const events = await ScheduleModel.find({ date: new Date(date) })
    .populate("announcer")
    .populate("createBy")
    .populate("updateBy")
    .sort({ startHour: 'asc' })
    .lean();


  const collectEventData = async () => {
    for (const event of events) {
      // Periksa tumpang tindih waktu dengan acara lain
      const isConflicting = await timeCheckUtils.checkScheduleConflict(date, event.startHour, event.endHour, event._id);

      // Buat objek data acara
      const eventDataItem = {
        id: event._id,
        title: event.title,
        desc: event.desc,
        category: event.category,
        announcer: event.announcer.map(a => a.fullname).join(', '),
        startHour: event.startHour,
        endHour: event.endHour,
        conflict: ''
      };

      // Jika ada tumpang tindih waktu, tambahkan pesan kesalahan
      if (isConflicting) {
        eventDataItem.conflict = 'Waktu Bentrok';
      }

      // Tambahkan data acara ke dalam array eventData
      eventData.push(eventDataItem);
    }
  };

  await collectEventData();

  return {
    status: true,
    data: eventData
  };
}

exports.getListByUser = async (params, session) => {
  const { date } = params;
  const eventData = [];

  const role = await RoleModel.findOne({ _id: session.roleId }).lean();
  const isAnnouncer = role.roleName === 'announcer'

  const filter = {
    date: new Date(date)
  }

  if (isAnnouncer) {
    filter.announcer = { $in: [session.id] }
  }

  const events = await ScheduleModel.find(filter)
    .populate("announcer")
    .populate("createBy")
    .populate("updateBy")
    .sort({ startHour: 'asc' })
    .lean();

  events.map(data => {
    eventData.push({
      id: data._id,
      title: data.title,
      desc: data.desc,
      category: data.category,
      announcer: data.announcer.map(a => a.fullname).join(', '),
      startHour: data.startHour,
      endHour: data.endHour
    })
  })

  return {
    status: true,
    data: eventData
  };
}

exports.getDetail = async (_id) => {
  const event = await ScheduleModel.findOne({ _id })
    .populate('announcer')
    .populate("createBy")
    .populate("updateBy")
    .lean();

  if (event) {
    const data = {
      id: event._id,
      title: event.title,
      desc: event.desc,
      category: event.category,
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
  const { type, date } = payload;
  let error, newData;

  const exceptData = await ScheduleModel.find({ date }).lean();
  const exceptIds = exceptData.map(event => event.eventId.toString());

  
  switch (type) {
    case 'daily':
      const currentDate = new Date(date);
      const currentDay = currentDate.getDay() === 0 ? 7 : currentDate.getDay();
      const dailyEvent = await DailyEventModel.find({ _id: { $nin: exceptIds }, day: currentDay, isDelete: false }).lean();

      if (dailyEvent.length > 0) {
        newData = dailyEvent.map(data => {
          return {
            eventId: data._id,
            title: data.title,
            desc: data.desc,
            category: 'Harian',
            announcer: data.announcer,
            date,
            startHour: data.startHour,
            endHour: data.endHour,
            createBy: session.id
          }
        })

        await ScheduleModel.insertMany(newData);

        return {
          status: true,
          message: 'Acara Berhasil Ditambahkan'
        };
      }

      error = new Error('Tidak Ada Acara Di Tanggal Ini Atau Acara Sudah Ditambahkan.');
      error.httpCode = 404;

      throw error;
    case 'special':
      const specialEvent = await SpecialEventModel.find({ _id: { $nin: exceptIds }, date, isDelete: false }).lean();

      if (specialEvent.length > 0) {
        newData = specialEvent.map(data => {
          return {
            eventId: data._id,
            title: data.title,
            desc: data.desc,
            category: 'Spesial',
            announcer: data.announcer,
            date,
            startHour: data.startHour,
            endHour: data.endHour,
            createBy: session.id
          }
        })
  
        await ScheduleModel.insertMany(newData);
  
        return {
          status: true,
          message: 'Acara Berhasil Ditambahkan'
        };;
      }

      error = new Error('Tidak Ada Acara Di Tanggal Ini Atau Acara Sudah Ditambahkan.');
      error.httpCode = 404;

      throw error;
    default:
      error = new Error('Gagal Mengambil Acara');
      error.httpCode = 404;

      throw error;
  }
}

exports.update = async (_id, payload, session) => {
  const { desc, announcer, startHour, endHour } = payload;

  const event = await ScheduleModel.findOne({ _id }).lean();

  if (event) {
    const isConflicting = await timeCheckUtils.checkScheduleConflict(event.date, startHour, endHour, _id);

    if (isConflicting) {
      const conflictError = new Error('Waktu acara bertabrakan dengan acara yang sudah ada.');
      conflictError.httpCode = 400;
      throw conflictError;
    }

    const update = {
      $set: {
        desc,
        announcer,
        startHour,
        endHour,
        updateDate: new Date(),
        updateBy: session.id
      }
    }
  
    await ScheduleModel.updateOne({ _id }, update);
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

exports.delete = async (_id) => {
  const event = await ScheduleModel.findOne({ _id }).lean();

  if (event) {
    await ScheduleModel.deleteOne({ _id });
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

exports.reset = async (date) => {
  const events = await ScheduleModel.find({ date: new Date(date) }).lean();

  if (events.length > 0) {
    await ScheduleModel.deleteMany({ date: new Date(date) });
    const response = {
      status : true,
      message: "Acara Berhasil Direset"
    }
    return response;
  }

  const error = new Error('Acara Tidak Ditemukan');
  error.httpCode = 404;

  throw error;
}

exports.sendNotification = async (date) => {
  const events = await ScheduleModel.find({ date: new Date(date) }).populate('announcer').sort({ startHour: 'asc' }).lean();
  const dataUser = [];

  events.map(data => {
    data.announcer.map(ann => {
      if (ann.telegramId) {
        dataUser.push({
          telegramId: ann.telegramId,
          fullname: ann.fullname,
          announcer: data.announcer.map(a => a.fullname).join(', '),
          title: data.title,
          desc: data.desc,
          date: moment(data.date).format('DD MMMM YYYY'),
          startHour: data.startHour,
          endHour: data.endHour
        })
      }
    })
  })

  dataUser.map(data => {
    const text = `Halo ${data.fullname}, ada pemberitahuan acara nih, berikut detail acaranya:\n\n📢 Acara: ${data.title}\n\n📄 Deskripsi: ${data.desc}\n\n🎙️ Penyiar: ${data.announcer}\n\n📅 Tanggal: ${data.date}\n\n🕒 Jam Mulai: ${data.startHour} WIB\n\n🕖 Jam Selesai: ${data.endHour} WIB`;

    telegramBotUtils.sendMessage(data.telegramId, text);
  })

  return {
    status: true,
    message: 'Notifikasi Berhasil Dikirim.'
  };
}
