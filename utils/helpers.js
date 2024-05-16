const { Keyboard } = require('grammy');

// Функция для обновления данных о пользователе
async function updateUserData(db, userId) {
  await db.run(`INSERT INTO users (id, timesStarted, lastSeen) VALUES (?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET timesStarted = timesStarted + 1, lastSeen = CURRENT_TIMESTAMP`, [userId]);
}

// Функция для записи взаимодействия пользователя
async function recordUserInteraction(db, userId) {
  await db.run(`INSERT INTO interactions (userId, interactionTime) VALUES (?, CURRENT_TIMESTAMP)`, [userId]);
}

// Функция для записи запроса на социальную сеть
async function recordSocialNetworkRequest(db, userId, networkName) {
  await db.run(`INSERT INTO socialNetworkRequests (userId, networkName, requestTime) VALUES (?, ?, CURRENT_TIMESTAMP)`, [userId, networkName]);
}

// Функция для записи запроса на промокод
async function recordPromoCodeRequest(db, userId, promoName) {
  await db.run(`INSERT INTO promoCodeRequests (userId, promoName, requestTime) VALUES (?, ?, CURRENT_TIMESTAMP)`, [userId, promoName]);
}

// Функция для проверки, является ли пользователь администратором
function isAdmin(userId, adminId) {
  return userId.toString() === adminId;
}

// Функция для создания клавиатуры с кнопками и кнопкой "Назад"
function createKeyboard(buttons) {
  const keyboard = new Keyboard();
  const buttonCount = buttons.length;
  const buttonsPerColumn = Math.ceil(buttonCount / 2);

  for (let i = 0; i < buttonsPerColumn; i++) {
    const firstButtonIndex = i;
    const secondButtonIndex = i + buttonsPerColumn;

    keyboard.text(buttons[firstButtonIndex].name);

    if (secondButtonIndex < buttonCount) {
      keyboard.text(buttons[secondButtonIndex].name);
    }

    keyboard.row();
  }

  keyboard.text('Назад ↩️');
  return keyboard;
}

// Функция для получения статистики использования бота
async function getUsageStats(db) {
  const totalStarts = await db.get(`SELECT SUM(timesStarted) as total FROM users`);
  const todayStarts = await db.get(`SELECT COUNT(*) as today FROM users WHERE date(lastSeen) = date('now')`);
  const totalInteractions = await db.get(`SELECT COUNT(*) as total FROM interactions`);
  const todayInteractions = await db.get(`SELECT COUNT(*) as today FROM interactions WHERE date(interactionTime) = date('now')`);

  const totalSocialNetworkRequests = await db.all(`SELECT networkName, COUNT(*) as total FROM socialNetworkRequests GROUP BY networkName`);
  const todaySocialNetworkRequests = await db.all(`SELECT networkName, COUNT(*) as today FROM socialNetworkRequests WHERE date(requestTime) = date('now') GROUP BY networkName`);

  const totalPromoCodeRequests = await db.all(`SELECT promoName, COUNT(*) as total FROM promoCodeRequests GROUP BY promoName`);
  const todayPromoCodeRequests = await db.all(`SELECT promoName, COUNT(*) as today FROM promoCodeRequests WHERE date(requestTime) = date('now') GROUP BY promoName`);

  return {
    totalStarts: totalStarts.total,
    todayStarts: todayStarts.today,
    totalInteractions: totalInteractions.total,
    todayInteractions: todayInteractions.today,
    totalSocialNetworkRequests,
    todaySocialNetworkRequests,
    totalPromoCodeRequests,
    todayPromoCodeRequests
  };
}

// Функция для получения сообщений
async function getMessages(db, replied = null) {
  let query = `SELECT * FROM messages`;
  if (replied !== null) {
    query += ` WHERE replied = ?`;
  }
  const messages = await db.all(query, replied !== null ? [replied] : []);
  return messages;
}

module.exports = { updateUserData, recordUserInteraction, recordSocialNetworkRequest, recordPromoCodeRequest, isAdmin, createKeyboard, getUsageStats,  getMessages};
