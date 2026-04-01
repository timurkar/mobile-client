export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API ключ не настроен на сервере' });
  }

  try {
    const { messages, model, temperature, max_tokens, system_prompt } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Параметр messages обязателен' });
    }

    const apiMessages = [];
    if (system_prompt) {
      apiMessages.push({ role: 'system', content: system_prompt });
    }
    apiMessages.push(...messages.map(m => ({ role: m.role, content: m.content })));

    const apiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || process.env.OPENAI_MODEL || 'gpt-4o',
        messages: apiMessages,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `Ошибка OpenAI: HTTP ${response.status}`;
      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Пустой ответ от модели.';
    const usage = data.usage || null;

    return res.status(200).json({ content, usage });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
