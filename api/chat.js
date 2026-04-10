// api/chat.js — Proxy seguro para MarketingIAPro Chatbot
// Usando Google Gemini API
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

  // Convertir formato Anthropic → Gemini
  const geminiMessages = messages.slice(-40).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: system ? { parts: [{ text: system }] } : undefined,
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: 1000 }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(response.status).json({ error: 'Error al contactar la IA', detail: errText });
    }

    const data = await response.json();
    // Convertir respuesta Gemini → formato Anthropic para que el frontend no cambie
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({
      content: [{ type: 'text', text }]
    });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
