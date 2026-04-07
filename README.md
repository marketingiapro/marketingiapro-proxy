# MarketingIAPro — Proxy Seguro para Chatbot

Este proxy protege tu API Key de Anthropic. El frontend nunca ve la key; 
toda comunicación pasa por este servidor en Vercel.

---

## 🚀 DESPLIEGUE EN VERCEL (5 minutos)

### Paso 1 — Crea una cuenta gratis en Vercel
Entra a https://vercel.com y regístrate con tu cuenta de GitHub, GitLab o email.

### Paso 2 — Sube este proyecto a GitHub
1. Ve a https://github.com/new y crea un repositorio llamado `marketingiapro-proxy`
2. Marca "Private" (importante: nunca publiques este repo en público)
3. Sube los archivos:
   ```
   marketingiapro-proxy/
   ├── api/
   │   └── chat.js       ← El proxy principal
   ├── vercel.json       ← Configuración de Vercel
   ├── package.json
   └── .gitignore
   ```

### Paso 3 — Importa el repo en Vercel
1. En vercel.com → "Add New Project"
2. Selecciona tu repositorio `marketingiapro-proxy`
3. Deja todo por defecto y haz clic en "Deploy"
4. En ~30 segundos tendrás una URL como: `https://marketingiapro-proxy.vercel.app`

### Paso 4 — Agrega tu API Key de Anthropic como variable de entorno
1. En tu proyecto de Vercel → "Settings" → "Environment Variables"
2. Agrega:
   - **Name:**  `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-api03-...` (tu key de https://console.anthropic.com)
   - **Environment:** Production + Preview + Development ✓
3. Clic en "Save"
4. Ve a "Deployments" → haz "Redeploy" para que tome la variable

### Paso 5 — Actualiza la URL en tu landing page
En el archivo `marketingiapro.html`, busca esta línea:

```js
var PROXY_URL = 'https://TU-PROXY.vercel.app/api/chat';
```

Y reemplázala con tu URL real:

```js
var PROXY_URL = 'https://marketingiapro-proxy.vercel.app/api/chat';
```

### Paso 6 — Agrega tu dominio a la lista CORS
En `api/chat.js`, agrega tu dominio real en `allowedOrigins`:

```js
const allowedOrigins = [
  'https://marketingiapro.com',
  'https://www.marketingiapro.com',
  // agrega aquí si tienes otro dominio
];
```

---

## 🧪 PRUEBA LOCAL (opcional)

```bash
npm install
npx vercel dev
# El proxy corre en http://localhost:3000/api/chat
```

Crea un archivo `.env` local (NO lo subas a Git):
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## 🔒 SEGURIDAD

- La API Key **nunca** sale del servidor
- CORS solo permite peticiones desde dominios autorizados
- El historial se limita a 40 mensajes para controlar costos
- Los headers de seguridad están configurados en `vercel.json`

---

## 💰 COSTOS ESTIMADOS

Vercel: **Gratis** (plan Hobby cubre hasta 100k invocaciones/mes)

Anthropic (Claude Sonnet):
- ~$3 por millón de tokens de entrada
- ~$15 por millón de tokens de salida
- Una conversación típica de 10 mensajes ≈ $0.01–0.03 USD

---

## ❓ SOPORTE

Si tienes dudas sobre el despliegue, el equipo de MarketingIAPro puede ayudarte.
