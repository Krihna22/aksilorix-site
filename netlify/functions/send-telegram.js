exports.handler = async function(event) {
  if (!event.body) {
    return { statusCode: 400, body: 'Bad Request: Missing body' };
  }
  try {
    const formData = JSON.parse(event.body);
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHANNEL_ID;
    if (!botToken || !chatId) {
        throw new Error("Секретные ключи (токен или ID канала) не найдены.");
    }
    const messageText = [
      `<b>Новая заявка</b>`,
      `--------------------`,
      `<b>Имя:</b> ${formData.name || 'не указано'}`,
      `<b>Контакт:</b> ${formData.contact || 'не указан'}`,
      `<b>Услуга:</b> ${formData.service || 'не указана'}`,
      `<b>Комментарий:</b> ${formData.comment || 'нет комментария'}`
    ].join('\n');
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML'
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      throw new Error(`Ошибка от Telegram API: ${errorData.description}`);
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Сообщение успешно отправлено' })
    };
  } catch (error) {
    console.error('Ошибка выполнения функции:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Внутренняя ошибка сервера.' })
    };
  }
};