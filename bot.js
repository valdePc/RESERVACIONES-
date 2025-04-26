// bot.js (arriba del todo)
const apiKey          = window._env.AIRTABLE_API_KEY;
const baseId          = window._env.AIRTABLE_BASE_ID;
const airtableBaseUrl = `https://api.airtable.com/v0/${baseId}`;
// URL absoluta del endpoint de tu backend
const chatUrl         = window._env.CHAT_API_URL || "/api/chat";

// —————— Inicio de bot.js ——————
const nombreUsuario = localStorage.getItem("currentUserName") || "amigo";
let ttsActive       = localStorage.getItem("ttsActive") === "true";
let availableVoices = [];
let defaultVoice    = null;

// Fuerza la carga inmediata de voces
availableVoices = speechSynthesis.getVoices();
speechSynthesis.onvoiceschanged = () => {
  availableVoices = speechSynthesis.getVoices();
  defaultVoice   = availableVoices.find(v => v.lang.startsWith('es'))
                  || availableVoices.find(v => v.lang.startsWith('en'))
                  || availableVoices[0];
};

function speak(text) {
  if (!('speechSynthesis' in window) || !ttsActive) return;
  const u = new SpeechSynthesisUtterance(text);
  if (/[áéíóúñü¿¡]/i.test(text))           u.lang = 'es-ES';
  else if (/[äöüß]/i.test(text))           u.lang = 'de-DE';
  else if (/\b(the|and|you|hello|please|thanks)\b/i.test(text)) u.lang = 'en-US';
  else                                     u.lang = 'es-ES';
  const voice = availableVoices.find(v => v.lang === u.lang && /Google/.test(v.name));
  if (voice) u.voice = voice;
  u.pitch = 1;
  u.rate  = 1.1;
  speechSynthesis.speak(u);
}

let chatContext = [];

// Obtener todos los registros de una tabla Airtable
async function fetchAirtable(tableName) {
  const resp = await fetch(`${airtableBaseUrl}/${encodeURIComponent(tableName)}`, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  });
  if (!resp.ok) throw new Error(`Airtable error ${resp.status}`);
  const { records } = await resp.json();
  return records.map(r => r.fields);
}

// Obtener reservas filtradas por contacto
async function fetchReservasPorContacto(contacto) {
  const formula = encodeURIComponent(`FIND('${contacto.toLowerCase()}', LOWER({Contacto}))`);
  const resp    = await fetch(`${airtableBaseUrl}/Reservas?filterByFormula=${formula}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  if (!resp.ok) throw new Error(`Airtable error ${resp.status}`);
  const { records } = await resp.json();
  return records.map(r => r.fields);
}

document.addEventListener("DOMContentLoaded", () => {
  const widget  = document.getElementById("chat-widget");
  const header  = document.getElementById("chat-header");
  const body    = document.getElementById("chat-body");
  const form    = document.getElementById("chat-form");
  const input   = document.getElementById("chat-input");
  const micBtn  = document.getElementById("mic-btn");
  const sendBtn = document.getElementById("send-btn");
  const ttsBtn  = document.getElementById("tts-btn");

  // Inicializar botón TTS
  ttsBtn.innerText = ttsActive ? "🔊" : "🔇";
  ttsBtn.addEventListener("click", () => {
    ttsActive = !ttsActive;
    localStorage.setItem("ttsActive", ttsActive);
    ttsBtn.innerText = ttsActive ? "🔊" : "🔇";
  });

  if (!widget || !header) {
    console.error("No encontré #chat-widget o #chat-header");
    return;
  }
  header.addEventListener("click", () => widget.classList.toggle("open"));
// —————— Loader “Cargando…” ——————
const loader = document.createElement("div");
loader.id = "chat-loader";
loader.style.cssText = `
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  font-style: italic;
  display: none;
  z-index: 1000;
`;
loader.innerText = "Cargando…";
widget.appendChild(loader);

function showLoader() { loader.style.display = "block"; }
function hideLoader() { loader.style.display = "none"; }

  input.addEventListener("input", () => {
    const hayTexto = input.value.trim().length > 0;
    sendBtn.style.display = hayTexto ? "inline-block" : "none";
    micBtn.style.display  = hayTexto ? "none" : "inline-block";
  });

  // Muestra registros en la tabla
  function displayRecords(regs) {
    const tbody = document.getElementById("reservasTabla")?.tBodies[0];
    if (!tbody) return;
    tbody.innerHTML = "";
    const fmt = d => d ? d.split("-").reverse().join("/") : "";
    regs.forEach(r => {
      const row = tbody.insertRow();
      row.insertCell().innerText = fmt(r["Fecha de Registro"]);
      row.insertCell().innerText = fmt(r.Entrada);
      row.insertCell().innerText = fmt(r.Salida);
      row.insertCell().innerText = r.Locación;
      row.insertCell().innerText = r["Número de Cupos"];
      row.insertCell().innerText = r["Número de Personas"];
      row.insertCell().innerText = r.Contacto;
      row.insertCell().innerText = r.Vuelo;
      row.insertCell().innerText = r.Comentario;
    });
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // Mostrar mensaje de usuario
    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.innerText = text;
    body.appendChild(userMsg);
    body.scrollTop = body.scrollHeight;

    input.value = "";
    sendBtn.style.display = "none";
    micBtn.style.display  = "inline-block";
    chatContext.push({ role: "user", content: text });

    // Normalización
    const normalized = text
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s:\/]/g, "");

    // Mapeo de campos
    const fieldMap = {
      "fecha de registro": "Fecha de Registro",
      "entrada":           "Entrada",
      "salida":            "Salida",
      "locacion":          "Locación",
      "numero de cupos":   "Número de Cupos",
      "numero de personas":"Número de Personas",
      "contacto":          "Contacto",
      "vuelo":             "Vuelo",
      "comentario":        "Comentario"
    };

    // — FILTRO EXACTO columna:valor —
    const exactMatch = normalized.match(/^(.+?):\s*(.+)$/);
    if (exactMatch && fieldMap[exactMatch[1]]) {
      const fieldKey = fieldMap[exactMatch[1]];
      const searchVal = exactMatch[2].trim();
      appendBot(`🔍 Filtrando por ${fieldKey}: ${searchVal}…`);
      try {
        const all = await fetchAirtable("Reservas");
        const regs = all.filter(rec => {
          const val = rec[fieldKey]; if (!val) return false;
          if (["Fecha de Registro","Entrada","Salida"].includes(fieldKey)) {
            const [d,m,y] = searchVal.split("/"); 
            return val === `${y}-${m}-${d}`;
          }
          if (["Número de Personas","Número de Cupos"].includes(fieldKey)) {
            return Number(val) === Number(searchVal);
          }
          return String(val).toLowerCase().includes(searchVal.toLowerCase());
        });
        displayRecords(regs);
        if (!regs.length) {
          appendBot(`
            😕 No encontré registros para "${contacto}".<br>
            ¿Quieres intentar buscar con otro nombre o te ayudo de otra forma? 😊<br>
            Puedes escribir:<br>
            👉 "Buscar contacto: Juan Pérez"<br>
            👉 "Mis registros"<br>
            👉 "Disponibilidad"
          `);
          chatContext.push({ role: "assistant", content: "No encontró registros, ofrece ayuda adicional." });
          return;
        }
        
      } catch {
        appendBot("❌ Error al filtrar registros.");
      }
      return;
    }

    // — FILTRO RANGO campo entre X y Y —
    const rangeMatch = normalized.match(
      /^(fecha de registro|entrada|salida|numero de cupos|numero de personas)\s*entre\s*([\d\/]+)\s*(?:y|a)\s*([\d\/]+)/
    );
    if (rangeMatch) {
      const keyNorm  = rangeMatch[1];
      const startVal = rangeMatch[2];
      const endVal   = rangeMatch[3];
      const fieldKey = fieldMap[keyNorm];
      appendBot(`🔍 Filtrando rango en ${fieldKey}…`);
      try {
        const all = await fetchAirtable("Reservas");
        const regs = all.filter(rec => {
          const val = rec[fieldKey]; if (!val) return false;
          if (["Fecha de Registro","Entrada","Salida"].includes(fieldKey)) {
            const toDate = s => { const [d,m,y]=s.split("/"); return new Date(`${y}-${m}-${d}`); };
            const d  = new Date(val), ds = toDate(startVal), de = toDate(endVal);
            return d >= ds && d <= de;
          }
          if (["Número de Personas","Número de Cupos"].includes(fieldKey)) {
            const n = Number(val), ns = Number(startVal), ne = Number(endVal);
            return n >= ns && n <= ne;
          }
          return false;
        });
        displayRecords(regs);
          if (regs.length) {
            appendBot("✅ Datos mostrados en la tabla.");
          } else {
            appendBot("No encontré resultados. ¿Quieres intentar con otro nombre o buscar otra cosa?");
          }
          
      } catch {
        appendBot("❌ Error al filtrar rango.");
      }
      return;
    }

    // — COMANDOS EXISTENTES —
    if (/\b(hola|hello|hallo)\b/.test(normalized)) {
      const r = normalized.includes("hello")
        ? `Hello ${nombreUsuario}! How can I help you today?`
        : normalized.includes("hallo")
          ? `Hallo ${nombreUsuario}! Wie kann ich Ihnen helfen?`
          : `¡Hola ${nombreUsuario}! ¿En qué puedo ayudarte hoy?`;
      appendBot(r);
      chatContext.push({ role: "assistant", content: r });
      return;
    }
    if (/\b(entrada|entradas|check in)\b/.test(normalized)) {
      window.mostrarEntradas();
      appendBot("✅ Entradas mostradas en la tabla.");
      return;
    }
    if (/\b(salida|salidas|check out)\b/.test(normalized)) {
      window.mostrarSalidas();
      appendBot("✅ Salidas mostradas en la tabla.");
      return;
    }
    if (/\b(disponibilidad|availability)\b/.test(normalized)) {
      window.verificarDisponibilidad();
      appendBot("⏳ Verificando disponibilidad…");
      return;
    }
    if (/^(?:datos del contacto|contacto|buscar contacto)/i.test(normalized)) {
      const c = text.split(":")[1]?.trim()
                || normalized.replace(/^(?:datos del contacto|contacto|buscar contacto)\s*/i, "");
      appendBot(`🔍 Buscando registros para: ${c}…`);
      try {
        const regs = await fetchReservasPorContacto(c);
        displayRecords(regs);
        if (regs.length) {
          appendBot("✅ Datos mostrados en la tabla.");
        } else {
          appendBot("No encontré resultados. ¿Quieres intentar con otro nombre o buscar otra cosa?");
        }
        
      } catch {
        appendBot("❌ Error al obtener registros.");
      }
      return;
    }
    if (/\b(mis registros|mis reservas|lo mio|lo mío)\b/.test(normalized)) {
      appendBot(`🔍 Buscando tus registros…`);
      try {
        const regs = await fetchReservasPorContacto(nombreUsuario);
        displayRecords(regs);
        if (regs.length) {
          appendBot("✅ Datos mostrados en la tabla.");
        } else {
          appendBot("No encontré resultados. ¿Quieres intentar con otro nombre o buscar otra cosa?");
        }
        
      } catch {
        appendBot("❌ Error al cargar tus registros.");
      }
      return;
    }

   // — FILTRO LIBRE POR CONTACTO —
if (/^[A-Za-zÁÉÍÓÚáéíóúñÑÜü ]+$/.test(normalized)) {

     // appendBot(`🔍 Buscando reservas para: ${text}…`);
      try {
        const regs = await fetchReservasPorContacto(text);
        displayRecords(regs);
        if (regs.length) {
          appendBot("✅ Datos mostrados en la tabla.");
          return;    // SOLO corto aquí cuando sí hay datos
        }
        // Si regs.length === 0   → no hago return, no pongo "no encontré"
        // y dejo que siga al fallback de IA para una respuesta natural
      } catch {
        appendBot("❌ Error al buscar reservas.");
        return;      // aquí sí cortas si hay error de fetch
      }
    }
    

    // — IA + Airtable como fallback —
    try {
      const [transporte, reservas] = await Promise.all([
        fetchAirtable("Transporte"),
        fetchAirtable("Reservas")
      ]);
      const systemMsg = [
        { role: "system", content: "Asistente de reservas multilingüe en desarrollo por Valde, para facilitar el trabajo de reservas de cupos de OWS y NPH a cargo de Anna del departamento de padrinos, - Hablas siempre en un español claro y cordial (salvo que detectes que el usuario escribe en inglés o alemán,puedes incluir emogis en ocaciones.Si se trata de una consulta de reservas, busca primero en Airtable; si no encuentras nada, ofrece que se comuniguen con valde al +18098122663 para que te actualicen y puedas hacer esa funcion." },
        { role: "system", content: `Transporte: ${JSON.stringify(transporte)}` },
        { role: "system", content: `Reservas: ${JSON.stringify(reservas)}` }
      ];
      const resp = await fetch(chatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...systemMsg, ...chatContext] })
      });
      const data = await resp.json();
      if (!resp.ok || !data.reply?.content) {
        appendBot(`
          ❌ No puedo procesar eso ahora.<br>
          <button id="contactValdeBtn" class="btn primary">📞 Contactar a Valde</button>
        `, "error");
        document.getElementById("contactValdeBtn")?.addEventListener("click", () => {
          window.open("https://wa.me/1XXXXXXXXXX?text=Hola%20Valde", "_blank");
        });
        return;
      }
      appendBot(data.reply.content);
      chatContext.push({ role: "assistant", content: data.reply.content });
      speak(data.reply.content.replace(/<[^>]+>/g, ''));
    } catch (err) {
      console.error(err);
      appendBot(`❌ Error de conexión o Airtable: ${err.message}`, "error");
    }
  });

  // Mostrar mensaje del bot con animación
// ——— appendBot con simulación de "escribiendo..." y animación suave ———

function appendBot(text, type = "bot", delayMs = 1500) {
  const body = document.getElementById("chat-body");

  // Mensaje de "escribiendo..."
  const typingMsg = document.createElement("div");
  typingMsg.className = `message typing ${type}`;
  typingMsg.innerText = "Escribiendo...";
  body.appendChild(typingMsg);
  body.scrollTop = body.scrollHeight;

  // Reemplazar después del delay
  setTimeout(() => {
    typingMsg.classList.add("fade-out");

    setTimeout(() => {
      typingMsg.remove();

      const realMsg = document.createElement("div");
      realMsg.className = `message ${type} fade-in`;
      realMsg.innerHTML = text.replace(/\n/g, "<br>");
      body.appendChild(realMsg);
      body.scrollTop = body.scrollHeight;
    }, 400); // tiempo de salida fade
  }, delayMs);
}

  // Reconocimiento de voz intacto
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang           = 'es-ES';
    recognition.continuous     = false;
    recognition.interimResults = false;
    micBtn.addEventListener("click", () => {
      recognition.start();
      micBtn.innerText = "🎙️ Escuchando...";
    });
    recognition.onresult = e => {
      input.value = e.results[0][0].transcript;
      sendBtn.style.display = "inline-block";
      micBtn.innerText = "🎤";
    };
    recognition.onerror = () => {
      micBtn.innerText = "🎤";
      alert("Error al capturar audio");
    };
  } else {
    micBtn.disabled = true;
    micBtn.title    = "Reconocimiento de voz no soportado";
  }
}); // ← cierra DOMContentLoaded
