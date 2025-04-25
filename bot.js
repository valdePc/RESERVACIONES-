// bot.js (arriba del todo)
const apiKey          = window._env.AIRTABLE_API_KEY;
const baseId          = window._env.AIRTABLE_BASE_ID;
const airtableBaseUrl = `https://api.airtable.com/v0/${baseId}`;

// URL absoluta del endpoint de tu backend
const chatUrl         = window._env.CHAT_API_URL || "/api/chat";

// —————— Arriba de todo en bot.js ——————
// —————— Inicio de bot.js ——————
const nombreUsuario = localStorage.getItem("currentUserName") || "amigo";
let ttsActive       = localStorage.getItem("ttsActive") === "true";
let availableVoices = [];
let defaultVoice    = null;

// Fuerza la carga inmediata de voces
availableVoices = speechSynthesis.getVoices();

// Cuando cambian (y también para navegadores que tardan en cargar)
speechSynthesis.onvoiceschanged = () => {
  availableVoices = speechSynthesis.getVoices();
  defaultVoice = availableVoices.find(v => v.lang.startsWith('es'))
               || availableVoices.find(v => v.lang.startsWith('en'))
               || availableVoices[0];
};

// Función de TTS
function speak(text) {
    if (!('speechSynthesis' in window) || !ttsActive) return;
  
    const utterance = new SpeechSynthesisUtterance(text);
  
    if (/[áéíóúñü¿¡]/i.test(text)) {
      utterance.lang = 'es-ES';
    } else if (/[äöüß]/i.test(text)) {
      utterance.lang = 'de-DE';
    } else if (/\b(the|and|you|hello|please|thanks)\b/i.test(text)) {
      utterance.lang = 'en-US';
    } else {
      utterance.lang = 'es-ES';
    }
  
    let voice = availableVoices.find(v => 
      v.lang === utterance.lang && /Google/.test(v.name)
    );
  
    if (voice) utterance.voice = voice;
  
    utterance.pitch = 1;
    utterance.rate = 1.1;
    speechSynthesis.speak(utterance);
  }
  
// —————— Fin de bloque TTS ——————


// Objeto para almacenar el contexto del chat
let chatContext = [];

// Función genérica para traer registros de Airtable
async function fetchAirtable(tableName) {
  const url = `${airtableBaseUrl}/${encodeURIComponent(tableName)}`;
  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  if (!resp.ok) throw new Error(`Airtable error ${resp.status}`);
  const data = await resp.json();
  return data.records.map(r => r.fields);
}

// Lógica del chat
document.addEventListener("DOMContentLoaded", () => {
  const widget = document.getElementById("chat-widget");
  const header = document.getElementById("chat-header");
  const body   = document.getElementById("chat-body");
  const form   = document.getElementById("chat-form");
  const input  = document.getElementById("chat-input");
  const micBtn = document.getElementById("mic-btn");
  const sendBtn = document.getElementById("send-btn");

// Inicializar estado del TTS desde localStorage

const ttsBtn = document.getElementById("tts-btn");
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

// Mostrar u ocultar el botón de enviar
input.addEventListener("input", () => {
  const hayTexto = input.value.trim().length > 0;
  sendBtn.style.display = hayTexto ? "inline-block" : "none";
  micBtn.style.display  = hayTexto ? "none" : "inline-block";
});

  

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const userMsg = document.createElement("div");
    userMsg.className = "message user";
    userMsg.innerText = text;
    body.appendChild(userMsg);
    body.scrollTop = body.scrollHeight;
    input.value = "";
    sendBtn.style.display = "none";
    micBtn.style.display = "inline-block";

    chatContext.push({ role: "user", content: text });

    const normalized = text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    // Permitir los dos puntos:
    .replace(/[^\w\s:]/g, "");
  

      if (/\b(hola|hello|hallo)\b/.test(normalized)) {
        const reply = normalized.includes("hello")
          ? `Hello ${nombreUsuario}! How can I help you today?`
          : normalized.includes("hallo")
            ? `Hallo ${nombreUsuario}! Wie kann ich Ihnen helfen?`
            : `¡Hola ${nombreUsuario}! ¿En qué puedo ayudarte hoy?`;
        appendBot(reply);
        chatContext.push({ role: "assistant", content: reply });
        return;
      }
      
    if (/\b(entrada|entradas|check in)\b/.test(normalized)) {
      window.mostrarEntradas();
      const reply = "He mostrado las entradas pendientes en la tabla.";
      appendBot(reply);
      chatContext.push({ role: "assistant", content: reply });
      return;
    }
    if (/\b(salida|salidas|check out)\b/.test(normalized)) {
      window.mostrarSalidas();
      const reply = "He mostrado las salidas actuales en la tabla.";
      appendBot(reply);
      chatContext.push({ role: "assistant", content: reply });
      return;
    }
    if (/\b(disponibilidad|availability)\b/.test(normalized)) {
      window.verificarDisponibilidad();
      const reply = "Verificando disponibilidad según tus fechas…";
      appendBot(reply);
      chatContext.push({ role: "assistant", content: reply });
      return;
    }
 // —————— Datos del contacto ——————
if (normalized.startsWith("datos del contacto")) {
  // Extraemos lo que venga tras los dos puntos
  const contacto = text.split(":")[1]?.trim();
  appendBot(`🔍 Buscando registros para el contacto: ${contacto}…`);
  try {
    const registros = await fetchReservasPorContacto(contacto);
    if (!registros.length) {
      appendBot(`No se encontraron registros para ${contacto}.`);
      return;
    }
    // Pinto los registros en la tabla
    const tbody = document.getElementById("reservasTabla")?.tBodies[0];
    if (tbody) {
      tbody.innerHTML = "";
      const fmt = d => d ? `${d.split("-")[2]}/${d.split("-")[1]}/${d.split("-")[0]}` : "";
      registros.forEach(r => {
        const row = tbody.insertRow();
        row.insertCell().innerText = fmt(r["Fecha de Registro"] || "");
        row.insertCell().innerText = fmt(r["Entrada"] || "");
        row.insertCell().innerText = fmt(r["Salida"] || "");
        row.insertCell().innerText = r["Locación"] || "";
        row.insertCell().innerText = r["Número de Cupos"] || "";
        row.insertCell().innerText = r["Número de Personas"] || "";
        row.insertCell().innerText = r["Contacto"] || "";
        row.insertCell().innerText = r["Vuelo"] || "";
        row.insertCell().innerText = r["Comentario"] || "";
      });
      appendBot("📋 He colocado los registros en la tabla de abajo. ¡Revisa si todo está bien!");
    }
  } catch (err) {
    console.error(err);
    appendBot("❌ Hubo un error al obtener los registros.");
  }
  return;  // Salimos sin llamar a /api/chat
}
// —————— fin Datos del contacto ——————

      
      if (/\b(mis registros|mis reservas|lo mío)\b/.test(normalized)) {
        appendBot(`Buscando tus registros, ${nombreUsuario}...`, 'bot');
        const registros = await fetchReservasPorContacto(nombreUsuario.toLowerCase());
        if (!registros.length) return appendBot(`No encontré registros tuyos, ${nombreUsuario}.`);
        // Crear filas en la tabla #reservasTabla (si existe)
const tabla = document.getElementById("reservasTabla")?.getElementsByTagName("tbody")[0];
if (tabla) {
  tabla.innerHTML = ""; // Limpia la tabla actual
  registros.forEach(r => {
    const row = tabla.insertRow();
    const fmt = d => d ? `${d.split("-")[2]}/${d.split("-")[1]}/${d.split("-")[0]}` : "";
    row.insertCell().innerText = fmt(r["Fecha de Registro"] || "");
    row.insertCell().innerText = fmt(r["Entrada"] || "");
    row.insertCell().innerText = fmt(r["Salida"] || "");
    row.insertCell().innerText = r["Locación"] || "";
    row.insertCell().innerText = r["Número de Cupos"] || "";
    row.insertCell().innerText = r["Número de Personas"] || "";
    row.insertCell().innerText = r["Contacto"] || "";
    row.insertCell().innerText = r["Vuelo"] || "";
    row.insertCell().innerText = r["Comentario"] || "";
    row.insertCell().innerText = ""; // Acción vacía por ahora
  });
  appendBot("🧾 He colocado tus registros en la tabla. ¡Échales un vistazo!");
}

        const lista = registros.map(r =>
          `📍 *${r['Locación'] || 'Sin ubicación'}*\n` +
          `🗓️ ${r['Entrada']} → ${r['Salida']}\n` +
          `👤 ${r['Contacto']} | 👥 ${r['Número de Personas'] || 1} personas` +
          (r['Comentario'] ? `\n💬 ${r['Comentario']}` : '')
        ).join("\n\n");
        appendBot(lista);
        return;
      }
          // —————— Búsqueda por contacto (añadir *antes* del try { … } principal) ——————
    if (/^(?:datos del contacto|contacto|buscar contacto)/i.test(normalized)) {
      // extrae nombre tras los dos puntos o la palabra
      let contacto = text.split(":")[1]?.trim();
      if (!contacto) {
        // si no vino con “:”, quita la palabra clave
        contacto = normalized.replace(/^(?:datos del contacto|contacto|buscar contacto)\s*/i, "");
      }
      appendBot(`🔍 Buscando registros de “${contacto}”…`);
      try {
        const registros = await fetchReservasPorContacto(contacto.toLowerCase());
        if (!registros.length) {
          appendBot(`No encontré registros para “${contacto}”.`);
        } else {
          // reutiliza tu tabla de reservas
          const tbody = document.getElementById("reservasTabla").tBodies[0];
          tbody.innerHTML = "";
          const fmt = d => d ? d.split("-").reverse().join("/") : "";
          registros.forEach(r => {
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
          appendBot("✅ Listo, los datos están en la tabla.");
        }
      } catch (err) {
        console.error(err);
        appendBot("❌ Error al buscar contacto.");
      }
      return;  // salimos sin llamar al AI
    }


    try {
    //  appendBot("Buscando datos en Airtable…", "info");
      const [transporte, reservas] = await Promise.all([
        fetchAirtable("Transporte"),
        fetchAirtable("Reservas")
      ]);

      const systemMessages = [
        { role: "system", content: "Eres un asistente de reservas multilingüe conectado a Airtable." },
        { role: "system", content: `Transporte: ${JSON.stringify(transporte)}` },
        { role: "system", content: `Reservas: ${JSON.stringify(reservas)}` }
      ];

      const resp = await fetch(chatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...systemMessages, ...chatContext]
        })
      });
      
      const data = await resp.json();

      if (!resp.ok || !data.reply || !data.reply.content) {
        appendBot(`
          En este momento no puedo realizar eso.<br>
          Si necesitas ayuda, puedes contactar a Valde directamente.  
          <br><br>
          <button id="contactValdeBtn" class="btn primary">📞 Contactar a Valde</button>
        `);
        
        document.getElementById("contactValdeBtn")?.addEventListener("click", () => {
          window.open("https://wa.me/1XXXXXXXXXX?text=Hola%20Valde,%20necesito%20ayuda%20con%20el%20sistema", "_blank");
        });
        return; // ¡salimos si hubo error!
      }
      
      // Aquí continúa solo si todo está OK
      appendBot(data.reply.content);
      chatContext.push({ role: "assistant", content: data.reply.content });
      speak(data.reply.content.replace(/<[^>]+>/g, ''));
      
      
    } catch (err) {
      console.error("❌ Error preparando o enviando:", err);
      const errMsg = `Error de conexión o Airtable: ${err.message}`;
      appendBot(errMsg, "error");
      chatContext.push({ role: "assistant", content: errMsg });
    }
  });

  function appendBot(txt, type = "bot", simulateTyping = true) {
    txt = txt.replace(/<br\s*\/?>/gi, "\n");
    const msg = document.createElement("div");
    msg.className = `message ${type}`;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  
    if (simulateTyping) {
      msg.innerHTML = `<span class="typing-dots">Escribiendo<span>.</span><span>.</span><span>.</span></span>`;
      
      let i = 0;
      setTimeout(() => {
        msg.innerHTML = "";
        const interval = setInterval(() => {
          msg.textContent += txt.charAt(i);
          msg.style.whiteSpace = "pre-wrap";          
          i++;
          if (i >= txt.length) {
            clearInterval(interval);
            speak(txt.replace(/<[^>]+>/g, '')); // TTS al final de la animación
          }
          body.scrollTop = body.scrollHeight;
        }, 30);
      }, 800);
    } else {
      // Inserta el texto limpito, respetando saltos de línea
      msg.textContent = txt;
      msg.style.whiteSpace = "pre-wrap";
      speak(txt.replace(/<[^>]+>/g, '')); // TTS inmediato si no se anima
    }
    
  }
  
  // Reconocimiento de voz
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
  
    micBtn.addEventListener("click", () => {
      recognition.start();
      micBtn.innerText = "🎙️ Escuchando...";
    });
  
    recognition.onresult = (event) => {
      const texto = event.results[0][0].transcript;
      input.value = texto;
      sendBtn.style.display = "inline-block";
      micBtn.innerText = "🎤";
    };
  
    recognition.onerror = () => {
      micBtn.innerText = "🎤";
      alert("Error al capturar audio");
    };
} else {
    micBtn.disabled = true;
    micBtn.title = "Reconocimiento de voz no soportado en este navegador";
  }
}); // ← Esta llave cierra el document.addEventListener

async function fetchAllReservas() {
    const url = `${airtableBaseUrl}/Reservas`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const data = await resp.json();
    return data.records.map(r => r.fields);
  }
  async function fetchReservasPorContacto(contacto) {
    const keyword = contacto.toLowerCase();
    const formula = `FIND('${keyword}', LOWER({Contacto}))`;
    const filter = encodeURIComponent(formula);
    const url = `${airtableBaseUrl}/Reservas?filterByFormula=${filter}`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const data = await resp.json();
    return data.records.map(r => r.fields);
  }
  


