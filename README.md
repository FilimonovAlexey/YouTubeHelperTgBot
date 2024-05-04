# Telegram бот помошник для владельца YouTube канала


## Демо бота

Скоро...


## Настройка бота

скоро...
    
## Деплой

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

