const TelegramBot = require('node-telegram-bot-api');
const bcrypt = require("bcryptjs");
const { UserModel } = require('../models');

const token = process.env.TOKEN_TELEGRAM_BOT;
const options = {
  polling: true
};

const bot = new TelegramBot(token, options);

const listen = async (logger) => {
  bot.on('polling_error', (error) => {
    console.error(`Polling error: ${error.code}, ${error.message}`);
    setTimeout(() => {
      bot.getUpdates();
    }, 15000); // Tunggu 5 detik sebelum mencoba polling lagi
  });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const name = msg.chat.first_name;
    const response = `Halo ${name}! \nSelamat datang di bot Telegram K-Lite. \nUntuk dapat terhubung dengan aplikasi dan menerima notifikasi, tolong ketik /registrasi diikuti email:password. \n \nContoh: /registrasi ryan@gmail.com:123456`;

    bot.sendMessage(chatId, response);
  });

  bot.onText(/\/registrasi/, async (msg) => {
    const chatId = msg.chat.id;
    const input = msg.text;
    const inputArray = input.split(' ');
    const usernamePass = inputArray[1];
    const usernamePassArray = usernamePass.split(':')

    let response = ``

    if(usernamePassArray.length === 2) {
      const userData = await UserModel.findOne({ username: usernamePassArray[0] }).lean();

      if(userData) {
        const isPasswordCorrect = await bcrypt.compare(usernamePassArray[1], userData.password);

        if (isPasswordCorrect) {
          await UserModel.updateOne(
            { _id: userData._id },
            { $set: {  telegramId: chatId } }
          );
          response = `Selamat ${userData.fullname}, Anda berhasil terhubung dengan aplikasi. \nMulai saat ini Anda akan menerima notifikasi secara otomatis.`
        } else {
          response = `Maaf, Email atau Password salah.`
        }

      }
    } else {
      response = `Maaf, perintah yang Anda masukkan tidak valid. Silakan coba lagi sesuai panduan.`
    }


    bot.sendMessage(chatId, response);
  });
  
  // bot.on('message', (msg) => {
  //   const chatId = msg.chat.id;
  //   const response = 'Maaf Perintah Tidak Tersedia.'
  //   bot.sendMessage(chatId, response);
  // })

  logger.info(`Telegram Bot Running`);
}

const sendMessage = async (id, message) => {
  await bot.sendMessage(id, message);
}

module.exports = { listen, sendMessage };