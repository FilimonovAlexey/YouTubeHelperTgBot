const { Keyboard } = require('grammy');

// Функция для обновления данных о пользователе
async function updateUserData(db, userId) {
  await db.run(`INSERT INTO users (id, timesStarted, lastSeen) VALUES (?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET timesStarted = timesStarted + 1, lastSeen = CURRENT_TIMESTAMP`, [userId]);
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
  return {
    totalStarts: totalStarts.total,
    todayStarts: todayStarts.today
  };
}

module.exports = { updateUserData, isAdmin, createKeyboard, getUsageStats };
