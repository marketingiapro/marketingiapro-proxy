// api/chat.js  — Proxy seguro para MarketingIAPro Chatbot
// Desplegado en Vercel: la API key NUNCA se expone al frontend

export default async function handler(req, res) {

  // ── CORS: solo permite peticiones desde tu dominio ──
  const allowedOrigins = [
    'https://marketingiapro.com',
    'https://www.marketingiapro.com',
    'https://magical-sawine-cc0c9c.netlify.app',
    'http://localhost',        // para pruebas locales
    'http://127.0.0.1',
    'null'                     // para abrir el HTML directo en el navegador
  ];

  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin) || origin === '') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    return res.status(403).json({ error: 'Origen no permitido' });
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // ── Validar body ──
  const { messages, system } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'El campo messages es requerido' });
  }

  // ── Límite de seguridad: max 40 mensajes en historial ──
  const trimmedMessages = messages.slice(-40);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            process.env.ANTHROPIC_API_KEY,  // variable de entorno en Vercel
        'anthropic-version':    '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 1000,
        system:     system || '',
        messages:   trimmedMessages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return res.status(response.status).json({ error: 'Error al contactar la IA', detail: errText });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
