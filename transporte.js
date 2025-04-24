// transporte.js

// Asegúrate de haber cargado translations.js antes de este script
const apiKey    = 'patL0v30ZFJzTux8W.c464296609147a785c6cfd6ccb96863088259df68518b69e56000c44eb73f0f0';
const baseId    = 'appLJWGTQ6xFXTRDl';
const tableName = 'Transporte';

document.addEventListener("DOMContentLoaded", () => {
  // 1. Aplica traducciones en la UI
  applyTranslationsTransport();

  // 2. Inicializa la fecha de registro
  document.getElementById("fechaRegistro").value = obtenerFechaLocal();

  // 3. Carga los viajes
  cargarViajes();

  // 4. Maneja el envío del formulario
  document.getElementById("transporteForm")
    .addEventListener("submit", async e => {
      e.preventDefault();
      await registrarTransporte();
    });

  // 5. Si cambian el idioma en otra pestaña, vuelve a traducir
  window.addEventListener("storage", e => {
    if (e.key === "language") applyTranslationsTransport();
  });
});

function applyTranslationsTransport() {
  const lang = localStorage.getItem("language") || "es";
  const d    = (translations[lang] && translations[lang].transport)
               ? translations[lang].transport
               : translations.es.transport;

  // Encabezados
  document.querySelector("h2").innerText                    = d.header;
  document.querySelector(".table-container h2").innerText   = d.tableHeader;

  // Formulario: labels y placeholders
  document.querySelector('label[for="fechaRegistro"]').innerText    = d.labelRegistroFecha;
  document.querySelector('label[for="fechaViaje"]').innerText       = d.labelViajeFecha;
  document.querySelector('label[for="tipoViaje"]').innerText        = d.labelTipoViaje;

  const tipo = document.getElementById("tipoViaje");
  tipo.options[0].text = d.optionDefaultTipo;
  tipo.options[1].text = d.optionLlegada;
  tipo.options[2].text = d.optionSalida;

  document.querySelector('label[for="horaViaje"]').innerText        = d.labelHoraViaje;
  document.querySelector('label[for="destinoInicial"]').innerText   = d.labelDestinoInicial;
  document.getElementById("destinoInicial").placeholder             = d.placeholderDestinoInicial;
  document.querySelector('label[for="destinoFinal"]').innerText     = d.labelDestinoFinal;
  document.getElementById("destinoFinal").placeholder               = d.placeholderDestinoFinal;
  document.querySelector('label[for="numPersonas"]').innerText      = d.labelNumPersonas;
  document.getElementById("numPersonas").placeholder                = d.placeholderNumPersonas;
  document.querySelector('label[for="chofer"]').innerText           = d.labelChofer;

  const chofer = document.getElementById("chofer");
  chofer.options[0].text = d.optionDefaultChofer;
  chofer.options[1].text = d.optionChoferHenry;
  chofer.options[2].text = d.optionChoferDomingo;
  chofer.options[3].text = d.optionChoferJuan;
  chofer.options[4].text = d.optionChoferOtro;

  document.querySelector('label[for="comentarios"]').innerText      = d.labelComentarios;
  document.getElementById("comentarios").placeholder                = d.placeholderComentarios;

  // Botones
  document.querySelector("button[type='submit']").innerText = d.buttonSave;
  document.querySelector(".back-button").ariaLabel           = d.buttonBackAria;

  // Tabla: encabezados
  const ths = document.querySelectorAll('#tablaTransporte thead th');
  [
    d.thRegistroFecha,  d.thViajeFecha,    d.thHora,
    d.thTipo,           d.thDestinoInicial, d.thDestinoFinal,
    d.thNumPersonas,    d.thChofer,        d.thComentarios
  ].forEach((txt, i) => ths[i].innerText = txt);
}

async function cargarViajes() {
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
  try {
    const res  = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const data = await res.json();
    const hoy  = new Date().toISOString().split("T")[0];

    data.records
      .map(r => ({ ...r.fields, FechaViaje: r.fields.FechaViaje?.split("T")[0] }))
      .filter(v => v.FechaViaje >= hoy)
      .sort((a, b) => new Date(a.FechaViaje) - new Date(b.FechaViaje))
      .forEach(v => agregarFilaATabla(v));
  } catch (e) {
    console.error("Error al cargar datos:", e);
  }
}

function agregarFilaATabla(t) {
  const tbody = document.getElementById("tablaTransporte").tBodies[0];
  const row   = tbody.insertRow();
  row.innerHTML = `
    <td>${formatoFechaDDMMYY(t.FechaRegistro)}</td>
    <td>${formatoFechaDDMMYY(t.FechaViaje)}</td>
    <td>${t.HoraViaje}</td>
    <td>${t.TipoViaje}</td>
    <td>${t.DestinoInicial}</td>
    <td>${t.DestinoFinal}</td>
    <td>${t.NumeroPersonas}</td>
    <td>${t.Chofer}</td>
    <td>${t.Comentarios}</td>
  `;
  const diff = diferenciaDias(t.FechaRegistro, t.FechaViaje);
  if (diff > 0 && diff <= 3) row.classList.add('warning');
}

async function registrarTransporte() {
  const t = {
    FechaRegistro:  new Date().toISOString().split("T")[0],
    FechaViaje:     document.getElementById("fechaViaje").value,
    HoraViaje:      document.getElementById("horaViaje").value,
    TipoViaje:      document.getElementById("tipoViaje").value,
    DestinoInicial: document.getElementById("destinoInicial").value,
    DestinoFinal:   document.getElementById("destinoFinal").value,
    NumeroPersonas: parseInt(document.getElementById("numPersonas").value, 10),
    Chofer:         document.getElementById("chofer").value,
    Comentarios:    document.getElementById("comentarios").value || ""
  };

  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields: t })
    });
    const lang = localStorage.getItem("language") || "es";
    if (res.ok) {
      alert(`${ translations[lang].transport.buttonSave } con éxito`);
      const data = await res.json();
      agregarFilaATabla(data.fields);
      limpiarFormulario();
    } else {
      console.error("Error al guardar transporte:", await res.json());
    }
  } catch (e) {
    console.error("Conexión fallida:", e);
  }
}

function limpiarFormulario() {
  [
    "fechaViaje","horaViaje","tipoViaje","destinoInicial",
    "destinoFinal","numPersonas","chofer","comentarios"
  ].forEach(id => document.getElementById(id).value = "");
}

function diferenciaDias(f1, f2) {
  const ms = 1000 * 60 * 60 * 24;
  return Math.ceil((new Date(f2) - new Date(f1)) / ms);
}

function formatoFechaDDMMYY(fecha) {
  if (!fecha) return "";
  const d  = new Date(fecha);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yy = String(d.getUTCFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function obtenerFechaLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${
    String(d.getMonth() + 1).padStart(2, "0")
  }-${
    String(d.getDate()).padStart(2, "0")
  }`;
}
