export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const hasApiKey = !!process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  return res.status(200).json({
    status: 'ok',
    apiKeyConfigured: hasApiKey,
    model,
  });
}
