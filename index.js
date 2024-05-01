require('dotenv').config();
const { Bot, GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy');
const fs = require('fs');

const bot = new Bot(process.env.BOT_API_KEY);

// Файл, в котором будут храниться данные о пользователях
const userDataFile = 'userData.json';

// Проверяем существование файла userData.json и создаем его, если он не существует
if (!fs.existsSync(userDataFile)) {
  fs.writeFileSync(userDataFile, '{}');
}

// Функция для обновления данных о пользователе
function updateUserData(userId) {
  let userData = JSON.parse(fs.readFileSync(userDataFile));
  if (!userData[userId]) {
    userData[userId] = {
      timesStarted: 0,
    };
  }
  userData[userId].timesStarted++;
  fs.writeFileSync(userDataFile, JSON.stringify(userData, null, 2));
}

// Функция для проверки, является ли пользователь администратором
function isAdmin(userId) {
  return userId.toString() === process.env.ADMIN_ID;
}

let userData = JSON.parse(fs.readFileSync(userDataFile));

bot.command('start', async (ctx) => {
  // Проверяем, запускает ли пользователь бот впервые
  if (!userData[ctx.from.id]) {
  // Если пользователь запускает бот впервые, обновляем данные о пользователе
    updateUserData(ctx.from.id);
  }
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

// Обработка команды администратора
bot.command('admin', async (ctx) => {
  // Проверяем, является ли пользователь администратором
  if (isAdmin(ctx.from.id)) {
    // Если пользователь администратор, отправляем статистику использования бота
    let userData = JSON.parse(fs.readFileSync(userDataFile));
    let totalStarts = 0;
    for (const userId in userData) {
      totalStarts += userData[userId].timesStarted;
    }
    await ctx.reply(`Статистика использования бота:\nВсего запусков: ${totalStarts}`);
  } else {
    await ctx.reply('У вас нет прав администратора!');
  }
});

// Массив кнопок для каждой социальной сети
const socialNetworks = [
  { name: 'YouTube', url: 'https://www.youtube.com/@tehno.maniak' },
  { name: 'Telegram', url: 'https://t.me/tehnomaniak07' },
  { name: 'Vk', url: 'https://vk.com/public212223166' },
  { name: 'ДЗЕН', url: 'https://dzen.ru/filimonov-blog.ru' },
  { name: 'TikTok', url: 'https://www.tiktok.com/' },
  { name: 'X', url: 'https://example.com/x' },
  { name: 'Instagram', url: 'https://www.instagram.com/' }
];

// Массив кнопок для каждой категории промокодов и скидок
const promoCodes = [
  { name: 'Хостинг сервера', url: 'https://timeweb.cloud/?i=108133' },
  { name: 'Яндекс практикум', url: 'https://example.com/yandex' },
];

// Функция для создания клавиатуры с кнопками и кнопкой "Назад"
function createKeyboard(buttons) {
  const keyboard = new Keyboard();
  const buttonCount = buttons.length;
  
  // Вычисляем количество кнопок в каждой колонке
  const buttonsPerColumn = Math.ceil(buttonCount / 2);
  
  for (let i = 0; i < buttonsPerColumn; i++) {
    // Добавляем кнопку в первую колонку
    const index1 = i;
    keyboard.text(buttons[index1].name);
    
    // Проверяем, есть ли кнопка для второй колонки
    const index2 = i + buttonsPerColumn;
    if (index2 < buttonCount) {
      // Добавляем кнопку во вторую колонку
      keyboard.text(buttons[index2].name);
    }
    
    // Переходим на следующую строку
    keyboard.row();
  }
  
  // Добавляем кнопку "Назад"
  keyboard.text('Назад');
  
  return keyboard;
}

// Функция для обработки нажатий на кнопки
function handleButtonClicks(ctx, items) {
  items.forEach(item => {
    bot.hears(item.name, async (ctx) => {
      const message = `Вот ссылка на ${item.name}: ${item.url}`;
      await ctx.reply(message);
    });
  });
}

// Обработчик команды "Социальные сети"
bot.hears('Социальные сети', async (ctx) => {
  const socialKeyboard = createKeyboard(socialNetworks);
  await ctx.reply('Выберите социальную сеть:', {
    reply_markup: socialKeyboard,
  });
  handleButtonClicks(ctx, socialNetworks);
});

// Обработчик команды "Промокоды и скидки"
bot.hears('Промокоды и скидки', async (ctx) => {
  const promoKeyboard = createKeyboard(promoCodes);
  await ctx.reply('Выберите категорию промокодов и скидок:', {
    reply_markup: promoKeyboard,
  });
  handleButtonClicks(ctx, promoCodes);
});

// Обработчик команды "Назад"
bot.hears('Назад', async (ctx) => {
  const startKeyboard = new Keyboard()
    .text('Социальные сети')
    .row()
    .text('Промокоды и скидки')
    .row()
    .text('Предложка')
    .row();
  await ctx.reply('Выберите действие:', {
    reply_markup: startKeyboard,
  });
});

// Отправляем сообщение с клавиатурой
bot.hears('Социальные сети', async (ctx) => {
  await ctx.reply('Выберите социальную сеть:', {
    reply_markup: socialKeyboard,
  });
});

// Обработка нажатий на кнопки
socialNetworks.forEach(network => {
  bot.hears(network.name, async (ctx) => {
    const message = `Вот ссылка на ${network.name}: ${network.url}`;
    await ctx.reply(message);
  });
});

// Отправляем сообщение с клавиатурой
bot.hears('Промокоды и скидки', async (ctx) => {
  await ctx.reply('Выберите категорию:', {
    reply_markup: promoKeyboard,
  });
});

// Обработка нажатий на кнопки
promoCodes.forEach(promo => {
  bot.hears(promo.name, async (ctx) => {
    const message = `Вот ссылка на ${promo.name}: ${promo.url}`;
    await ctx.reply(message);
  });
});

bot.hears('Предложка', async (ctx) => {
  await ctx.reply('Опишите ваше предложение или сообщение, которое вы хотели бы отправить автору бота.');
});

// Обработчик всех текстовых сообщений, чтобы пересылать сообщения от пользователя автору бота
bot.on('message:text', async (ctx) => {
  const authorId = process.env.ADMIN_ID;
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




// bot.hears('Промокоды и скидки', async (ctx) => {
//   // Создаем инлайновую клавиатуру
//   const promoKeyboard = new InlineKeyboard()
//     .text('Хостинг сервера', 'hosting')
//     .row()
//     .text('Яндекс практикум', 'yandex')

//   // Отправляем клавиатуру в ответе на сообщение
//   await ctx.reply('Выберите категорию:', {
//     reply_markup: promoKeyboard,
//   });
// });











// bot.hears('Социальные сети', async (ctx) => {
//   // Создаем инлайновую клавиатуру
//   const socialKeyboard = new Keyboard()
//     .text('YouTube', 'YouTube')
//     .row()
//     .text('Telegram', 'Telegram')
//     .row()
//     .text('Vk', 'Vk')
//     .row()
//     .text('ДЗЕН', 'ДЗЕН')
//     .row()
//     .text('TikTok', 'TikTok')
//     .row()
//     .text('X', 'X')
//     .row()
//     .text('Instagram', 'Instagram')

//   // Отправляем клавиатуру в ответе на сообщение
//   await ctx.reply('Выберите социальную сеть:', {
//     reply_markup: socialKeyboard,
//   });
// });

// bot.hears('Промокоды и скидки', async (ctx) => {
//   // Создаем инлайновую клавиатуру
//   const promoKeyboard = new InlineKeyboard()
//     .text('Хостинг сервера', 'hosting')
//     .row()
//     .text('Яндекс практикум', 'yandex')

//   // Отправляем клавиатуру в ответе на сообщение
//   await ctx.reply('Выберите категорию:', {
//     reply_markup: promoKeyboard,
//   });
// });

// //Единный обработчик для двух событий
// bot.on('callback_query', async (ctx) => {
//   const query = ctx.callbackQuery.data;
//   let message = '';

//   switch (query) {
//     case 'hosting':
//       message = 'Вот ссылка на хостинг сервера: https://timeweb.cloud/?i=108133';
//       break;
//     case 'yandex':
//       message = 'Вот ссылка на Яндекс практикум: https://example.com/yandex';
//       break;
//     case 'YouTube':
//       message = 'Вот ссылка на YouTube: https://www.youtube.com/@tehno.maniak';
//       break;
//     case 'Telegram':
//       message = 'Вот ссылка на Telegram: https://t.me/tehnomaniak07';
//       break;
//     case 'Vk':
//       message = 'Вот ссылка на ВКонтакте: https://vk.com/public212223166';
//       break;
//     case 'ДЗЕН':
//       message = 'Вот ссылка на Дзен: https://dzen.ru/filimonov-blog.ru';
//       break;
//     case 'TikTok':
//       message = 'Вот ссылка на TikTok: https://www.tiktok.com/';
//       break;
//     case 'X':
//       message = 'Вот ссылка на X: https://example.com/x';
//       break;
//     case 'Instagram':
//       message = 'Вот ссылка на Instagram: https://www.instagram.com/';
//       break;
//     default:
//       message = 'Извините, что-то пошло не так.';
//   }

//   // Отправляем сообщение с ссылкой
//   await ctx.reply(message);
// });



// bot.on('callback_query:data', async (ctx) => {
//   const socialNetwork = ctx.callbackQuery.data;

//   // Определяем URL для выбранной социальной сети
//   let socialUrl;
//   switch (socialNetwork) {
//     case 'YouTube':
//       socialUrl = 'https://www.youtube.com/@tehno.maniak';
//       break;
//     case 'Telegram':
//       socialUrl = 'https://t.me/tehnomaniak07';
//       break;
//     case 'Vk':
//       socialUrl = 'https://vk.com/public212223166';
//       break;
//     case 'ДЗЕН':
//       socialUrl = 'https://dzen.ru/filimonov-blog.ru';
//       break;
//     case 'TikTok':
//         socialUrl = 'https://dzen.ru/filimonov-blog.ru';
//       break;
//     case 'X':
//         socialUrl = 'https://dzen.ru/filimonov-blog.ru';
//     break;
//     case 'Instagram':
//       socialUrl = 'https://dzen.ru/filimonov-blog.ru';
//     break;
//     default:
//       socialUrl = '';
//   }

//   // Отправляем ссылку на социальную сеть
//   if (socialUrl) {
//     await ctx.reply(`Вот ваша ссылка на ${socialNetwork}: ${socialUrl}`);
//   } else {
//     await ctx.reply('Извините, что-то пошло не так.');
//   }
// });

// bot.on('callback_query', async (ctx) => {
//   const query = ctx.callbackQuery.data;
//   let message = '';

//   switch (query) {
//     case 'hosting':
//       message = 'Вот ссылка на хостинг сервера: https://example.com/hosting';
//       break;
//     case 'yandex':
//       message = 'Вот ссылка на Яндекс практикум: https://example.com/yandex';
//       break;
//     default:
//       message = 'Извините, что-то пошло не так.';
//   }

//   await ctx.reply(message);
// });