// Массив кнопок для каждой социальной сети
const socialNetworks = [
  { name: 'YouTube', url: 'https://www.youtube.com/@tehno.maniak', type: 'social' },
  { name: 'Telegram', url: 'https://t.me/tehnomaniak07', type: 'social' },
  { name: 'Vk', url: 'https://vk.com/public212223166', type: 'social' },
  { name: 'ДЗЕН', url: 'https://dzen.ru/filimonov-blog.ru', type: 'social' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@texno_maniak', type: 'social' },
  { name: 'X', url: 'https://twitter.com/F1L_zZz', type: 'social' },
  { name: 'Instagram', url: 'https://www.instagram.com/tehnomaniak_blog/', type: 'social' },
  { name: 'Boosty', url: 'https://boosty.to/tehnomaniak', type: 'social' },
  { name: 'GitHub', url: 'https://github.com/FilimonovAlexey', type: 'social' },
];

// Массив кнопок для каждой категории промокодов и скидок
const promoCodes = [
  { 
    name: 'Хостинг сервера, 1 месяц в подарок', 
    url: 'https://timeweb.cloud/?i=108133', 
    code: 'tehnomaniak', 
    description: '1 месяц в подарок при оплате сервера на 1 год', 
    type: 'promo' 
  },
  { 
    name: 'Хостинг сервера, 3 месяца в подарок', 
    url: 'https://timeweb.cloud/?i=108133', 
    code: 'super', 
    description: '3 месяца в подарок при оплате сервера на 2 года', 
    type: 'promo' 
  },
  { 
    name: 'Яндекс практикум, 7%', 
    url: 'https://practicum.yandex.ru/referrals/?ref_code=gAAAAABizGZbt_yK2rqrrwUrDO021HiKFOH4wJIJfdzZnf3KotvnQc7T_hpUXAJkbLMg2AVWCK5eFIT0bbxV1_w_RhqJ3GQmNw%3D%3D',
    code: 'Не нужен, скидка предоставляет при переходе по ссылке', 
    description: 'Скидка 7% на курсы Яндекс Практикум', 
    type: 'promo' 
  },
];

module.exports = { socialNetworks, promoCodes };