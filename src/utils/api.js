// Определяем базовый URL бекенда
function getBackendUrl() {
  if (typeof window !== 'undefined' && window.location) {
    // Web — используем тот же домен (Vercel)
    return window.location.origin;
  }
  // Native — нужно указать URL вашего Vercel деплоя
  return 'https://mobile-client.vercel.app';
}

export async function sendChatRequest(messages, settings) {
  const { model, systemPrompt, temperature, maxTokens } = settings;

  const backendUrl = getBackendUrl();

  const response = await fetch(`${backendUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      model,
      system_prompt: systemPrompt,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || `Ошибка сервера: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.content;
}

export async function checkBackendHealth() {
  try {
    const backendUrl = getBackendUrl();
    const response = await fetch(`${backendUrl}/api/health`);
    return await response.json();
  } catch {
    return { status: 'error', apiKeyConfigured: false };
  }
}
