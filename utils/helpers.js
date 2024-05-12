//Вспомогательные функции

const fs = require('fs');
const { Keyboard } = require('grammy');

// Функция для обновления данных о пользователе
function updateUserData(userDataFile, userId) {
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
function isAdmin(userId, adminId) {
  return userId.toString() === adminId;
}

// Функция для создания клавиатуры с кнопками и кнопкой "Назад"
function createKeyboard(buttons) {
  const keyboard = new Keyboard();
  const buttonCount = buttons.length;
  const buttonsPerColumn = Math.ceil(buttonCount / 2);

  // По две кнопки на строку
  for (let i = 0; i < buttonsPerColumn; i++) {
    const firstButtonIndex = i;
    const secondButtonIndex = i + buttonsPerColumn;

    keyboard.text(buttons[firstButtonIndex].name); // Добавляем первую кнопку

    if (secondButtonIndex < buttonCount) {
      keyboard.text(buttons[secondButtonIndex].name); // Добавляем вторую кнопку, если она существует
    }

    keyboard.row(); // Начинаем новую строку после каждой пары кнопок
  }

  keyboard.text('Назад ↩️'); // Добавляем кнопку "Назад" в конец
  return keyboard;
}

module.exports = { updateUserData, isAdmin, createKeyboard };