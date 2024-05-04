# Telegram бот предложка

**Функционал Telegram бота:**
- **Предложка**  
У пользователей есть возможность отправлять сообщения со своими преложениями, которые будут направлены администратору.
Поддерживаются любые виды сообщений: Текст, Видео, Аудио, Ссылки.
- **Социальные сети**  
Есть возможность добавить свои социальные сети и ссылки на них.
- **Промокоды и скидки**  
Возможность добавить персональные ссылки и промокоды для получений скидок.
- **Статитстика использования бота**  
Есть возможность получения статистики об использовании бота, если вы администратор.

## Технологии
![JavaScript](https://img.shields.io/badge/-JavaScript-f7df1e?logo=javaScript&logoColor=black)
![GrammyJS](https://img.shields.io/badge/-grammyjs-61daf8?logo=javaScript&logoColor=black)
![TelegramAPI](https://img.shields.io/badge/-Telegram-99d6f8?logo=Telegram&logoColor=black)

## Демо бота

Опробовать бота можно в Telegram по ссылке - [@Tehnomaniac_Helper_bot](https://t.me/Tehnomaniac_Helper_bot)

Команды Telegram бота:
- /start
Запуск Telegram бота.
- /admin
Получение статистики об использовании бота, если вы администртор.

![](./public/prev.png)
    
## Деплой бота на сервер

* Установим Git и обновим компоненты системы
```bash
sudo apt update
sudo apt install git
```

* Клонируем репозиторий с ботом на сервер:
```bash
git clone https://github.com/FilimonovAlexey/YouTubeHelperTgBot.git
```

* Клонируем репозиторий с ботом на сервер:
```bash
cd YouTubeHelperTgBot
```

* Устанавливаем Node.js и пакетный менеджер npm
```bash
sudo apt install nodejs
sudo apt install npm
```

* Обновим Node js и npm, после выполняем перезапуск сервера
```bash
sudo npm install -g n
sudo n stable
```
* Устанавливаем все зависимости
```bash
cd YouTubeHelperTgBot
npm i
```

* Создаем глобальную переменную
```bash
nano .env
```

* Создаем внутри файлов .env две переменные
```bash
BOT_API_KEY=''
ADMIN_ID=''
```

* Устанавливаем pm2 для запуска бота
```bash
npm i pm2 -g
```

* Запуск бота на сервере
```bash
pm2 start index.js
```

## Документация по grammy js

[Документация grammy js](https://grammy.dev/guide/)


## Authors

- [@FilimonovAlexey](https://github.com/FilimonovAlexey)

