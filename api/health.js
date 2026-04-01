module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  var hasApiKey = !!process.env.OPENAI_API_KEY;
  var model = process.env.OPENAI_MODEL || 'gpt-4o';

  return res.status(200).json({
    status: 'ok',
    apiKeyConfigured: hasApiKey,
    model: model,
  });
};
