require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy');
const fs = require('fs');
const { logger } = require('./utils/logger');
const { updateUserData, isAdmin, createKeyboard } = require('./utils/helpers');
const { socialNetworks, promoCodes } = require('./utils/buttons');

// Создание экземпляра бота
const bot = new Bot(process.env.BOT_API_KEY);

// Файл, в котором будут храниться данные о пользователях
const userDataFile = 'userData.json';

// Проверяем существование файла userData.json и создаем его, если он не существует
if (!fs.existsSync(userDataFile)) {
  fs.writeFileSync(userDataFile, '{}');
}

let userData = JSON.parse(fs.readFileSync(userDataFile));

bot.command('start', async (ctx) => {
  // Проверяем, запускает ли пользователь бот впервые
  if (!userData[ctx.from.id]) {
    // Если пользователь запускает бот впервые, обновляем данные о пользователе
    updateUserData(userDataFile, ctx.from.id);
  }
  const startKeyboard = new Keyboard()
    .text('🙋‍♂️ Предложка')
    .row()
    .text('📲 Социальные сети')
    .row()
    .text('🔥 Промокоды и скидки')
    .row()
  await ctx.reply(
    'Привет! Я бот помошник канала Техноманьяк!',
  );
  await ctx.reply('С чего начнем? Выбирай 👇', {
    reply_markup: startKeyboard,
  });
});

// Обработка команды администратора
bot.command('admin', async (ctx) => {
  // Проверяем, является ли пользователь администратором
  if (isAdmin(ctx.from.id, process.env.ADMIN_ID)) {
    // Если пользователь администратор, отправляем статистику использования бота
    let totalStarts = 0;
    for (const userId in userData) {
      totalStarts += userData[userId].timesStarted;
    }
    await ctx.reply(`Статистика использования бота:\nВсего запусков: ${totalStarts}`);
  } else {
    await ctx.reply('У вас нет прав администратора!');
  }
});

// Функция для обработки нажатий на кнопки
function handleButtonClicks(items) {
  items.forEach(item => {
      bot.hears(item.name, async (ctx) => {
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

bot.hears('📲 Социальные сети', async (ctx) => {
  const socialKeyboard = createKeyboard(socialNetworks);
  await ctx.reply('Выберите социальную сеть:', {
    reply_markup: socialKeyboard,
  });
});

// Обработчик команды "Промокоды и скидки"
bot.hears('🔥 Промокоды и скидки', async (ctx) => {
  const promoKeyboard = createKeyboard(promoCodes);
  await ctx.reply('Выберите категорию промокодов и скидок:', {
    reply_markup: promoKeyboard,
  });
});

// Обработчик команды "Назад"
bot.hears('Назад ↩️', async (ctx) => {
  const startKeyboard = new Keyboard()
    .text('🙋‍♂️ Предложка')
    .row()
    .text('📲 Социальные сети')
    .row()
    .text('🔥 Промокоды и скидки')
    .row()
  await ctx.reply('Выберите действие:', {
    reply_markup: startKeyboard,
  });
});

// Обработка нажатий на кнопки социальных сетей
handleButtonClicks(socialNetworks);

// Обработка нажатий на кнопки промокодов и скидок
handleButtonClicks(promoCodes);

// Отправляем сообщение с клавиатурой
bot.hears('📲 Социальные сети', async (ctx) => {
  await ctx.reply('Выберите социальную сеть:', {
    reply_markup: socialKeyboard,
  });
});

// Отправляем сообщение с клавиатурой
bot.hears('🔥 Промокоды и скидки', async (ctx) => {
  await ctx.reply('Выберите категорию:', {
    reply_markup: promoKeyboard,
  });
});

// Флаг для отслеживания нажатия на кнопку "Предложка" и пользователя, который ее нажал
let suggestionClicked = {};

// Обработчик команды "Предложка"
bot.hears('🙋‍♂️ Предложка', async (ctx) => {
  // Устанавливаем флаг нажатия на кнопку "Предложка" для данного пользователя
  suggestionClicked[ctx.from.id] = true;
  await ctx.reply('Опишите ваше предложение или сообщение, которое вы хотели бы отправить автору бота.');
});

// Обработчик всех текстовых сообщений, чтобы пересылать сообщения от пользователя автору бота
bot.on('message', async (ctx) => {
  const authorId = process.env.ADMIN_ID;
  
  // Проверяем, была ли нажата кнопка "Предложка" перед отправкой сообщения
  if (suggestionClicked[ctx.from.id]) {
    // Пересылаем сообщение от пользователя автору бота
    if (ctx.message.text) {
      // Если это текстовое сообщение
      await ctx.forwardMessage(authorId, { text: ctx.message.text });
    } else if (ctx.message.voice) {
      // Если это голосовое сообщение
      await ctx.forwardMessage(authorId, { voice: ctx.message.voice });
    } else if (ctx.message.photo) {
      // Если это фото
      await ctx.forwardMessage(authorId, { photo: ctx.message.photo });
    } else if (ctx.message.video) {
      // Если это видео
      await ctx.forwardMessage(authorId, { video: ctx.message.video });
    } else {
      // Если это другой тип сообщения, вы можете обработать его соответственно
      await ctx.forwardMessage(authorId, ctx.message);
    }
    
    // Отправляем пользователю подтверждение о том, что его сообщение отправлено автору
    await ctx.reply('Ваше сообщение успешно отправлено автору бота');

    // Сбрасываем флаг нажатия на кнопку "Предложка" после отправки сообщения
    suggestionClicked[ctx.from.id] = false;
  } else {
    // Отправляем сообщение пользователю о том, что сначала нужно нажать кнопку "Предложка"
    await ctx.reply('Пожалуйста, сначала нажмите кнопку "Предложка" для отправки сообщения автору канала!');
  }
});


//Команды бота и их описание
bot.api.setMyCommands([
  {
    command:'start', 
    description: 'Старт бота',
  },
]);

//Обработчик ошибок
bot.catch((err) => {
  const ctx = err.ctx;
  logger.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    logger.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    logger.error("Could not contact Telegram:", e);
  } else {
    logger.error("Unknown error:", e);
  }
  });

bot.start();