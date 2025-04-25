// server.js (CommonJS)

const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1) Leer .env
require('dotenv').config();

console.log('🔑 GEMINI_API_KEY   =', process.env.GEMINI_API_KEY);
console.log('🔑 AIRTABLE_API_KEY =', process.env.AIRTABLE_API_KEY);

// 2) Cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 3) Crear Express, middlewares y servir estáticos
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // sirve index.html, CSS, JS, etc.

// 4) Función para extraer datos de reserva y convertir fecha a ISO
function extractDatos(text) {
  const fechaRegex    = /(\d{1,2}\s+de\s+\w+(?:\s+de\s+\d{4})?|\d{4}-\d{2}-\d{2})/i;
  const personasRegex = /(\d+)\s*(?:personas|persona|pax)/i;
  const nombreRegex   = /(?:nombre es|me llamo|soy)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i;

  const fechaMatch    = text.match(fechaRegex);
  const personasMatch = text.match(personasRegex);
  const nombreMatch   = text.match(nombreRegex);

  let rawFecha = fechaMatch ? fechaMatch[1] : '';
  let isoFecha = '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawFecha)) {
    // YA está en formato ISO
    isoFecha = rawFecha;
  } else if (rawFecha) {
    // Parsear "20 de mayo [de 2025]" al formato YYYY-MM-DD
    const meses = {
      enero: 1, febrero: 2, marzo: 3, abril: 4,
      mayo: 5, junio: 6, julio: 7, agosto: 8,
      septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
    };
    const parts = rawFecha.toLowerCase().split(' ');
    const day = parseInt(parts[0], 10);
    const monthName = parts[2];
    const month = meses[monthName] || 0;
    const year = parts.length >= 5 ? parseInt(parts[4], 10) : new Date().getFullYear();
    if (month) {
      isoFecha = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return {
    nombre:     nombreMatch   ? nombreMatch[1]   : '',
    fechaTexto: rawFecha,
    fechaISO:   isoFecha,
    personas:   personasMatch ? personasMatch[1] : ''
  };
}

// 5) Función para guardar una reserva en Airtable
async function guardarReservaEnAirtable({ nombre, fechaISO, personas, mensaje }) {
  const airtableBaseId = process.env.AIRTABLE_BASE_ID || 'appLJWGTQ6xFXTRDl';
  const tableName      = 'Reservas';
  const url            = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(tableName)}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify({
      records: [{
        fields: {
          "Fecha de Registro":    new Date().toISOString().split('T')[0], // yyyy-mm-dd
          "Entrada":              fechaISO,                                // ISO
          "Salida":               "",
          "Locación":             "",
          "# Número de Cupos":     "",
          "# Número de Personas":  personas,
          "Contacto":             nombre,
          "Vuelo":                "",
          "Comentario":           mensaje,
          "Eliminados":           false
        }
      }]
    })
  });

  console.log('📬 Airtable status:', resp.status);
  const text = await resp.text();
  console.log('📬 Airtable response body:', text);

  if (!resp.ok) {
    throw new Error(`Error al guardar en Airtable: ${text}`);
  }
}

// 6) Rutas

// 6.1) Home: sirve tu HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 6.2) Ping: prueba de vida
app.get('/ping', (req, res) => {
  res.send('🏓 Pong!');
});

// 6.3) Chat con Gemini + lógica de reserva
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Se requiere un array "messages"' });
    }
    // 👇 Detectar si el usuario pidió ayuda
    const ultima = messages[messages.length - 1].content.toLowerCase();

    if (ultima.includes("ayuda") || ultima.includes("comandos") || ultima.includes("opciones")) {
      const respuesta = `
        <b>Reservas para una fecha específica:</b><br>
        <b>Reservas de una persona específica:</b><br>
        <b>Disponibilidad:</b> ¿Está disponible la fecha?<br>
        <b>Detalles de una reserva:</b> Puedes decirme el nombre.<br>
      `;
      return res.json({ reply: { content: respuesta } });
    }
    

// Construir prompt
const prompt = [
  'System: Eres un asistente de reservas multilingüe conectado a Airtable.',
  'System: Responde solo a lo que se te pregunta. Sé breve y preciso. No incluyas información extra.',
  ...messages.map(m => `${m.role === 'user' ? 'User' : 'System'}: ${m.content}`),
  'AI:'
].join('\n');

// Generar respuesta de Gemini
const model  = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro-002' });
const result = await model.generateContent(prompt);
let reply  = result.response.text();

reply = reply.replace(/\n/g, '<br>'); // <-- esta línea es la clave

console.log('🕵️ Último mensaje:', messages[messages.length - 1].content);
console.log('✅ Gemini respondió:', reply);

    // Detectar intención de reservar
// ya definida arriba: const ultima = ...

    let confirmación = '';
    if (/quiero reservar|resérvame|hacer una reserva|reservar/i.test(ultima)) {
      console.log('🎯 Detectada intención de reserva');
      const datos = extractDatos(ultima);
      if (datos.fechaISO) {
        await guardarReservaEnAirtable({
          nombre:   datos.nombre   || 'Cliente',
          fechaISO: datos.fechaISO,
          personas: datos.personas || '',
          mensaje:  ultima
        });
        console.log('📦 Reserva guardada en Airtable.');
        confirmación = '\n\n✅ Su reserva ha sido guardada con éxito.';
      } else {
        confirmación = '\n\n⚠️ No pude entender la fecha para guardar en Airtable.';
      }
    }

    return res.json({ reply: { content: reply + confirmación } });
  } catch (err) {
    console.error('💥 Error en /api/chat:', err);
    return res.status(500).json({
      error: err.message,
      stack: err.stack?.split('\n', 3)
    });
  }
});

// 7) Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});
