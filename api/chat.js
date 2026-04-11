// api/chat.js — Proxy seguro para MarketingIAPro Chatbot
// Usando Groq API
export default async function handler(req, res) {
  // ── CORS ──
  const allowedOrigins = [
    'https://marketingiapro.com',
    'https://www.marketingiapro.com',
    'https://magical-sawine-cc0c9c.netlify.app',
    'http://localhost',
    'http://127.0.0.1',
    'null'
  ];
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin) || origin === '') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    return res.status(403).json({ error: 'Origen no permitido' });
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { messages, system } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'El campo messages es requerido' });
  }

  // Construir mensajes para Groq (compatible con formato OpenAI)
  const groqMessages = [];
  if (system) {
    groqMessages.push({ role: 'system', content: system });
  }
  messages.slice(-40).forEach(m => {
    groqMessages.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content });
  });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', response.status, errText);
      return res.status(response.status).json({ error: 'Error al contactar la IA', detail: errText });
    }

    const data = await response.json();
    // Convertir respuesta Groq → formato Anthropic para que el frontend no cambie
    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({
      content: [{ type: 'text', text }]
    });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
