export async function sendChatRequest(messages, settings) {
  const { apiKey, apiUrl, model, systemPrompt, temperature, maxTokens } = settings;

  if (!apiKey) {
    throw new Error('API ключ не указан. Перейдите в Настройки и добавьте ключ.');
  }

  const systemMessage = { role: 'system', content: systemPrompt };
  const apiMessages = [systemMessage, ...messages.map(m => ({ role: m.role, content: m.content }))];

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData?.error?.message || `Ошибка HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Пустой ответ от модели.';
}
