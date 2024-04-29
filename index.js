require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy');

const bot = new Bot(process.env.BOT_API_KEY);

bot.command('start', async (ctx) => {
  const startKeyboard = new Keyboard()
    .text('Социальные сети')
    .row()
    .text('Промокоды и скидки')
    .row()
    .text('Предложка')
    .row()
  await ctx.reply(
    'Привет! Я бот помошник канала Техноманьяк!',
  );
  await ctx.reply('С чего начнем? Выбирай 👇', {
    reply_markup: startKeyboard,
  });
});

bot.hears('Социальные сети', async (ctx) => {
  // Создаем инлайновую клавиатуру
  const socialKeyboard = new InlineKeyboard()
    .text('YouTube', 'YouTube')
    .text('Telegram', 'Telegram')
    .text('Vk', 'Vk')
    .text('ДЗЕН', 'ДЗЕН')
    .text('TikTok', 'TikTok')
    .text('X', 'X')
    .text('Instagram', 'Instagram')

  // Отправляем клавиатуру в ответе на сообщение
  await ctx.reply('Выберите социальную сеть:', {
    reply_markup: socialKeyboard,
  });
});

bot.on('callback_query:data', async (ctx) => {
  const socialNetwork = ctx.callbackQuery.data;

  // Определяем URL для выбранной социальной сети
  let socialUrl;
  switch (socialNetwork) {
    case 'YouTube':
      socialUrl = 'https://www.youtube.com/@tehno.maniak';
      break;
    case 'Telegram':
      socialUrl = 'https://t.me/tehnomaniak07';
      break;
    case 'Vk':
      socialUrl = 'https://vk.com/public212223166';
      break;
    case 'ДЗЕН':
      socialUrl = 'https://dzen.ru/filimonov-blog.ru';
      break;
    case 'TikTok':
        socialUrl = 'https://dzen.ru/filimonov-blog.ru';
      break;
    case 'X':
        socialUrl = 'https://dzen.ru/filimonov-blog.ru';
    break;
    case 'Instagram':
      socialUrl = 'https://dzen.ru/filimonov-blog.ru';
    break;
    default:
      socialUrl = '';
  }

  // Отправляем ссылку на социальную сеть
  if (socialUrl) {
    await ctx.reply(`Вот ваша ссылка на ${socialNetwork}: ${socialUrl}`);
  } else {
    await ctx.reply('Извините, что-то пошло не так.');
  }
});

bot.hears('Промокоды и скидки', async (ctx) => {
  // Создаем инлайновую клавиатуру
  const promoKeyboard = new InlineKeyboard()
    .text('Хостинг сервера', 'Хостинг сервера')
    .text('Яндекс практикум', 'Яндекс практикум')

  // Отправляем клавиатуру в ответе на сообщение
  await ctx.reply('Выберите категорию:', {
    reply_markup: promoKeyboard,
  });
});

bot.hears('Предложка', async (ctx) => {
  await ctx.reply('Опишите ваше предложение или сообщение, которое вы хотели бы отправить автору бота.');
});

// Обработчик всех текстовых сообщений, чтобы пересылать сообщения от пользователя автору бота
bot.on('message:text', async (ctx) => {
  const authorId = process.env.ADMIN_TELEGRAM_ID;
  const message = ctx.message.text;

  // Пересылаем сообщение от пользователя автору бота
  await ctx.forwardMessage(authorId, { text: message });
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
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
  });

bot.start();