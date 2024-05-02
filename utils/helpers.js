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

module.exports = { updateUserData, isAdmin, createKeyboard };