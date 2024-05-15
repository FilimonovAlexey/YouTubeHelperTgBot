require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard, session } = require('grammy');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { logger } = require('./utils/logger');
const { updateUserData, recordUserInteraction, recordSocialNetworkRequest, recordPromoCodeRequest, isAdmin, createKeyboard, getUsageStats } = require('./utils/helpers');
const { socialNetworks, promoCodes } = require('./utils/buttons');

// Создание экземпляра бота
const bot = new Bot(process.env.BOT_API_KEY);

// Настройка сессии с использованием внутреннего хранилища
bot.use(session({
  initial: () => ({})
}));

// Подключение к базе данных SQLite
let db;
(async () => {
  db = await open({
    filename: './userData.db',
    driver: sqlite3.Database
  });

  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    timesStarted INTEGER DEFAULT 0,
    lastSeen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    interactionTime TIMESTAMP
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS socialNetworkRequests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    networkName TEXT,
    requestTime TIMESTAMP
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS promoCodeRequests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    promoName TEXT,
    requestTime TIMESTAMP
  )`);

  logger.info('Database initialized and connection established');
})();

// Обработчики команд
bot.command('start', async (ctx) => {
  logger.info(`User ${ctx.from.id} started the bot`);
  await updateUserData(db, ctx.from.id);
  const startKeyboard = new Keyboard()
    .text('🙋‍♂️ Предложка')
    .row()
    .text('📲 Социальные сети')
    .row()
    .text('🔥 Промокоды и скидки')
    .row();
  await ctx.reply('Привет! Я бот помощник канала Техноманьяк!');
  await ctx.reply('С чего начнем? Выбирай 👇', {
    reply_markup: startKeyboard,
  });
});

bot.command('admin', async (ctx) => {
  if (isAdmin(ctx.from.id, process.env.ADMIN_ID)) {
    const stats = await getUsageStats(db);
    let response = `Статистика использования бота:\nВсего запусков: ${stats.totalStarts}\nИспользовали бота сегодня: ${stats.todayStarts}\nВсего взаимодействий: ${stats.totalInteractions}\nВзаимодействий сегодня: ${stats.todayInteractions}\n\n`;

    response += 'Запросы на социальные сети:\n';
    for (const { networkName, total } of stats.totalSocialNetworkRequests) {
      const today = stats.todaySocialNetworkRequests.find(n => n.networkName === networkName)?.today || 0;
      response += `${networkName} - Всего: ${total}, Сегодня: ${today}\n`;
    }

    response += '\nЗапросы на промокоды:\n';
    for (const { promoName, total } of stats.totalPromoCodeRequests) {
      const today = stats.todayPromoCodeRequests.find(p => p.promoName === promoName)?.today || 0;
      response += `${promoName} - Всего: ${total}, Сегодня: ${today}\n`;
    }

    await ctx.reply(response);
  } else {
    await ctx.reply('У вас нет прав администратора!');
  }
});

// Обработка взаимодействий с ботом
bot.use(async (ctx, next) => {
  await recordUserInteraction(db, ctx.from.id);
  return next();
});

// Функция для обработки нажатий на кнопки
function handleButtonClicks(items, recordRequest) {
  items.forEach(item => {
    bot.hears(item.name, async (ctx) => {
      await recordUserInteraction(db, ctx.from.id);
      await recordRequest(db, ctx.from.id, item.name);
      let message = '';
      if (item.type === 'social') {
        message = `Вот ссылка на ${item.name}: ${item.url}`;
      } else if (item.type === 'promo') {
        message = `Вот ссылка на ${item.name}: ${item.url}\n\nПромокод: ${item.code}\n\nОписание: ${item.description}`;
      }
      await ctx.reply(message);
    });
  });
}

handleButtonClicks(socialNetworks, recordSocialNetworkRequest);
handleButtonClicks(promoCodes, recordPromoCodeRequest);

bot.hears('📲 Социальные сети', async (ctx) => {
  const socialKeyboard = createKeyboard(socialNetworks);
  await ctx.reply('Выберите социальную сеть:', {
    reply_markup: socialKeyboard,
  });
});

bot.hears('🔥 Промокоды и скидки', async (ctx) => {
  const promoKeyboard = createKeyboard(promoCodes);
  await ctx.reply('Выберите категорию промокодов и скидок:', {
    reply_markup: promoKeyboard,
  });
});

bot.hears('Назад ↩️', async (ctx) => {
  const startKeyboard = new Keyboard()
    .text('🙋‍♂️ Предложка')
    .row()
    .text('📲 Социальные сети')
    .row()
    .text('🔥 Промокоды и скидки')
    .row();
  await ctx.reply('Выберите действие:', {
    reply_markup: startKeyboard,
  });
});

let suggestionClicked = {};

bot.hears('🙋‍♂️ Предложка', async (ctx) => {
  suggestionClicked[ctx.from.id] = true;
  await ctx.reply('Опишите ваше предложение или сообщение, которое вы хотели бы отправить автору бота.');
});

bot.on('message', async (ctx) => {
  const authorId = process.env.ADMIN_ID;
  const fromId = ctx.from.id.toString();

  if (fromId === authorId && ctx.session.replyToUser) {
    await ctx.api.sendMessage(ctx.session.replyToUser, 'На ваше сообщение получен ответ от админа канала.');
    if (ctx.message.text) {
      await ctx.api.sendMessage(ctx.session.replyToUser, ctx.message.text);
    } else if (ctx.message.voice) {
      await ctx.api.sendVoice(ctx.session.replyToUser, ctx.message.voice.file_id);
    } else if (ctx.message.video) {
      await ctx.api.sendVideo(ctx.session.replyToUser, ctx.message.video.file_id);
    } else if (ctx.message.photo) {
      const photo = ctx.message.photo.pop();
      await ctx.api.sendPhoto(ctx.session.replyToUser, photo.file_id);
    } else if (ctx.message.audio) {
      await ctx.api.sendAudio(ctx.session.replyToUser, ctx.message.audio.file_id);
    } else if (ctx.message.document) {
      await ctx.api.sendDocument(ctx.session.replyToUser, ctx.message.document.file_id);
    }
    await ctx.reply('Ответ направлен.');
    ctx.session.replyToUser = undefined;
    return;
  }

  if (suggestionClicked[fromId]) {
    const userInfo = `Сообщение от ${ctx.from.first_name || ''} ${ctx.from.last_name || ''} (@${ctx.from.username || 'нет username'}, ID: ${ctx.from.id}): `;
    
    const inlineKeyboard = new InlineKeyboard().text('Ответить', `reply-${ctx.from.id}`);

    if (ctx.message.text) {
      await ctx.api.sendMessage(authorId, userInfo + ctx.message.text, { reply_markup: inlineKeyboard });
    } else {
      const mediaType = Object.keys(ctx.message).find(key => ['photo', 'video', 'document', 'audio', 'voice'].includes(key));
      if (mediaType) {
        await ctx.api.copyMessage(authorId, ctx.chat.id, ctx.message.message_id, {
          caption: userInfo,
          reply_markup: inlineKeyboard
        });
      }
    }

    await ctx.reply('Ваше сообщение успешно отправлено автору бота');
    suggestionClicked[fromId] = false;
  } else {
    if (fromId !== authorId) {
      await ctx.reply('Пожалуйста, сначала нажмите кнопку "Предложка" для отправки сообщения автору канала!');
    }
  }
});

bot.callbackQuery(/^reply-(\d+)$/, async (ctx) => {
  const targetUserId = ctx.match[1];
  ctx.session.replyToUser = targetUserId;
  await ctx.answerCallbackQuery('Вы можете ответить текстом, аудио, видео или фото.');
});

bot.catch((err) => {
  const ctx = err.ctx;
  logger.error(`Error while handling update ${ctx.update.update_id}:`, err);
});

bot.start();
