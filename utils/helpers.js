//Вспомогательные функции

const fs = require('fs');

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

module.exports = { updateUserData, isAdmin };