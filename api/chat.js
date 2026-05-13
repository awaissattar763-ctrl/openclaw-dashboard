// Vercel Serverless Function — Groq API proxy (FREE!)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, system, apiKey, model } = req.body;
    const key = process.env.GROQ_API_KEY || apiKey;
    if (!key) return res.status(401).json({ error: 'No Groq API key. Add GROQ_API_KEY in Vercel env or enter in Config.' });

    const groqMessages = [{ role: 'system', content: system || 'You are OpenClaw, an enterprise AI agent.' }, ...messages];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: groqMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    return res.status(200).json({ content: data.choices?.[0]?.message?.content || 'No response.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
