import { applyTranslations } from './translations.js';

const apiKey    = process.env.AIRTABLE_API_KEY;
const baseId    = process.env.BASE_ID;
const tableName     = 'Reservas';
const authTableName = 'Contraseñas';
const maxCapacity   = 40;
let availableSpaces = maxCapacity;

import { setLanguage } from './translations.js';

document.addEventListener("DOMContentLoaded", () => {
  // 1) Traducciones
  const savedLang = localStorage.getItem('lang') || 'es'
  setLanguage(savedLang)

  const langSelect = document.getElementById('languageSelect')
  if (langSelect) {
    langSelect.value = savedLang
    langSelect.addEventListener('change', e => {
      setLanguage(e.target.value)
    })
  }

  // …aquí continúa el resto de tu inicialización (tema, logo, formularios, etc.)…
})

  // 2) Tema oscuro
  const toggleThemeSwitch = document.getElementById('toggleThemeSwitch')
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode')
    toggleThemeSwitch.checked = true
  }
  toggleThemeSwitch.addEventListener('change', () => {
    const dark = toggleThemeSwitch.checked
    document.body.classList.toggle('dark-mode', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  })

  // 3) Logo personalizado


  // 4) Logout
  const logoutSwitch = document.getElementById('logoutSwitch')
  logoutSwitch.addEventListener('change', () => {
    if (logoutSwitch.checked) {
      localStorage.removeItem('theme')
      localStorage.removeItem('loginLogo')
      window.location.href = 'index.html'
    }
  })

  // 5) Cambio de contraseña
  document.getElementById('changePwdBtn').addEventListener('click', handleChangePassword)

  // 6) Fecha registro y carga inicial
  const fechaRegistro = document.getElementById('registroFecha')
  fechaRegistro.value    = new Date().toISOString().split('T')[0]
  fechaRegistro.readOnly = true
  obtenerDatosReservas()

  // 7) Navegación protegida
  document.getElementById('btnestadistica').addEventListener('click', () => {
    const pw = prompt('Contraseña para Estadística:')
    if (pw === 'visita1234') window.location.href = 'estadistica.html'
    else alert('Contraseña incorrecta.')
  })
  document.getElementById('btnBDD').addEventListener('click', () => {
    const pw = prompt('Contraseña para BDD:')
    if (pw === 'visita1234') {
      window.location.href = 'https://airtable.com/appLJWGTQ6xFXTRDl/...'
    } else alert('Contraseña incorrecta.')
  })
  document.getElementById('btnTransporte').addEventListener('click', () => {
    window.location.href = 'transporte.html'
  })

  // 8) Menú de ajustes (open/close y aria)
  const settingsBtn  = document.getElementById('settingsBtn')
  const settingsMenu = document.getElementById('settingsMenu')
  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', e => {
      e.stopPropagation()
      const isOpen = settingsMenu.classList.toggle('open')
      settingsBtn.setAttribute('aria-expanded', isOpen)
    })
    document.addEventListener('click', () => {
      settingsMenu.classList.remove('open')
      settingsBtn.setAttribute('aria-expanded', 'false')
    })
    settingsMenu.addEventListener('click', e => e.stopPropagation())
  } else console.warn('settingsBtn o settingsMenu no encontrados')

  // 9) Formulario de reserva
  document.getElementById('reservaForm').addEventListener('submit', async e => {
    e.preventDefault()
    await registrarReserva()
  })

  // 10) Filtros y disponibilidad
  document.getElementById('btnEntradas').addEventListener('click', mostrarEntradas)
  document.getElementById('btnSalidas').addEventListener('click', mostrarSalidas)
  document.getElementById('btnDisponibilidad').addEventListener('click', verificarDisponibilidad)

  console.log('✅ agenda.js cargado correctamente')


// ————————— Funciones principales —————————

async function handleChangePassword() {
  try {
    const res   = await fetch(`https://api.airtable.com/v0/${baseId}/${authTableName}`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const users = (await res.json()).records;
    if (!users.length) return alert('No hay usuarios.');

    const menu = users.map((u,i) => `${i+1}) ${u.fields.Name}`).join('\n');
    const idx  = parseInt(prompt(`Seleccione usuario:\n${menu}`),10) - 1;
    if (idx < 0 || idx >= users.length) return alert('Selección inválida.');

    const record = users[idx];
    if (prompt(`Contraseña actual de ${record.fields.Name}:`) !== record.fields.Contraseña) {
      return alert('Contraseña incorrecta.');
    }
    const newPw = prompt('Nueva contraseña:');
    if (!newPw || newPw !== prompt('Confirma nueva contraseña:')) {
      return alert('No coinciden.');
    }

    const patchRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/${authTableName}/${record.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: { Contraseña: newPw } })
    });
    if (!patchRes.ok) throw new Error();
    alert('Contraseña actualizada.');
  } catch {
    alert('Error al cambiar contraseña.');
  }
}

async function obtenerDatosReservas() {
  const { records } = await fetch(
    `https://api.airtable.com/v0/${baseId}/${tableName}`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  }).then(r => r.json());

  const hoy = new Date().toISOString().split("T")[0];
  const vigentes = records
    .map(r => ({ ...r.fields, id:r.id }))
    .filter(r => new Date(r.Salida) >= new Date(hoy) && r.Eliminados !== "Eliminado")
    .sort((a,b) => new Date(a.Entrada) - new Date(b.Entrada));

  mostrarReservasEnTabla(vigentes);

  const ocupados = vigentes
    .filter(r => new Date(r.Entrada) <= new Date(hoy) && new Date(r.Salida) >= new Date(hoy))
    .reduce((sum, r) => sum + (r['Número de Cupos']||0), 0);

  verificarCapacidad(ocupados);
}

function verificarCapacidad(ocupados) {
  availableSpaces = maxCapacity - ocupados;
  document.getElementById("availability").innerText =
    `Ocupados hoy: ${ocupados} / Disponibles: ${availableSpaces}`;
  const pct = Math.round((ocupados / maxCapacity) * 100);
  const fill = document.querySelector(".availability-fill");
  if (fill) fill.style.width = `${pct}%`;
}

async function registrarReserva() {
  const num = parseInt(document.getElementById("numero").value, 10);
  if (num > availableSpaces) {
    return alert('No hay suficientes espacios.');
  }
  const fields = {
    'Fecha de Registro': document.getElementById("registroFecha").value,
    'Entrada':           document.getElementById("Entrada").value,
    'Salida':            document.getElementById("Salida").value,
    'Locación':          document.getElementById("locacion").value,
    'Número de Cupos':   num,
    'Número de Personas': parseInt(document.getElementById("personas").value,10),
    'Contacto':          document.getElementById("contacto").value,
    'Vuelo':             document.getElementById("vuelo").value,
    'Comentario':        document.getElementById("comentario").value
  };
  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });
    if (!res.ok) throw new Error();
    const json = await res.json();
    fields.id = json.id;
    alert('Reserva guardada.');
    agregarReservaATabla(fields);
    limpiarFormulario();
    obtenerDatosReservas();
  } catch {
    alert('Error al guardar.');
  }
}

async function fetchAllReservas() {
  const { records } = await fetch(
    `https://api.airtable.com/v0/${baseId}/${tableName}`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  }).then(r => r.json());
  return records.map(r => ({ ...r.fields, id:r.id }));
}

function mostrarReservasEnTabla(list) {
  const tbody = document.getElementById("reservasTabla").tBodies[0];
  tbody.innerHTML = '';
  list.forEach(r => {
    const row = tbody.insertRow();
    const fmt = d => d ? `${d.split('-')[2]}/${d.split('-')[1]}/${d.split('-')[0].slice(-2)}` : '';

    // 1. Fecha de Registro
    row.insertCell().innerText = fmt(r['Fecha de Registro']);
    // 2. Entrada
    row.insertCell().innerText = fmt(r.Entrada);
    // 3. Salida
    row.insertCell().innerText = fmt(r.Salida);
    // 4. Ubicación (campo “Locación” en Airtable)
    row.insertCell().innerText = r['Locación'] || '';
    // 5. Cupos
    row.insertCell().innerText = r['Número de Cupos'];
    // 6. Personas
    row.insertCell().innerText = r['Número de Personas'];
    // 7. Contacto
    row.insertCell().innerText = r.Contacto;
    // 8. Vuelo
    row.insertCell().innerText = r.Vuelo;
    // 9. Comentario
    row.insertCell().innerText = r.Comentario;

    // 10. Acción (Eliminar) -> siempre en la última columna
    const btn = document.createElement('button');
    btn.innerText = 'Eliminar';
    btn.className = 'btn secondary';
    btn.onclick = async () => {
      if (confirm('¿Eliminar reserva?')) {
        await marcarComoEliminado(r.id);
        row.remove();
      }
    };
    row.insertCell().appendChild(btn);
  });
}

async function mostrarEntradas() {
  const all = await fetchAllReservas();
  mostrarReservasEnTabla(all.filter(r => new Date(r.Entrada) >= new Date()));
}

async function mostrarSalidas() {
  const all = await fetchAllReservas();
  const now = new Date();
  mostrarReservasEnTabla(
    all.filter(r => new Date(r.Entrada) < now && new Date(r.Salida) >= now)
  );
}

async function marcarComoEliminado(id) {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableName}/${id}`, {
      method:'PATCH',
      headers:{
        Authorization:`Bearer ${apiKey}`,
        'Content-Type':'application/json'
      },
      body: JSON.stringify({ fields:{ Eliminados:"Eliminado" } })
    });
    if (!res.ok) throw new Error();
    alert("Marcada como eliminada.");
  } catch {
    alert("Error al eliminar.");
  }
}

async function verificarDisponibilidad() {
  const entrada = prompt("Fecha entrada (DD/MM/AA o DD-MM-AA):");
  const salida  = prompt("Fecha salida  (DD/MM/AA o DD-MM-AA):");
  const cupos   = parseInt(prompt("Cupos necesarios:"), 10);
  if (!entrada || !salida || isNaN(cupos)) {
    return alert("Datos inválidos.");
  }
  const toISO = f => {
    const s = f.replace(/[-/]/g,''), d=s.slice(0,2), m=s.slice(2,4), y=s.slice(4);
    return `20${y}-${m}-${d}`;
  };
  const start = new Date(toISO(entrada));
  const end   = new Date(toISO(salida));
  const reservas = await obtenerReservasEnRango(start, end);

  let ok = [], no = [], range = null, state = null;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
    const key = d.toISOString().split("T")[0];
    const used = reservas[key] || 0;
    const avail= maxCapacity - used;
    const cur  = cupos <= avail;
    const fmt  = key.split("-").reverse().join("/");
    if (cur !== state) {
      if (range) (state ? ok : no).push(range);
      range = [fmt];
      state = cur;
    } else {
      range[1] = fmt;
    }
  }
  if (range) (state ? ok : no).push(range);

  let msg = "";
  if (ok.length) {
    msg += "✅ Con cupos:\n";
    ok.forEach(r => {
      const [i,f] = r;
      msg += i===f ? ` • ${i}\n` : ` • ${i} ↔ ${f}\n`;
    });
  }
  if (no.length) {
    msg += "\n❌ Sin cupos:\n";
    no.forEach(r => {
      const [i,f] = r;
      msg += i===f ? ` • ${i}\n` : ` • ${i} ↔ ${f}\n`;
    });
  }
  alert(msg || "Sin disponibilidad.");
}

async function obtenerReservasEnRango(start, end) {
  const res  = await fetch(
    `https://api.airtable.com/v0/${baseId}/${tableName}`, {
    headers:{ Authorization:`Bearer ${apiKey}` }
  });
  const data = await res.json();
  const map  = {};
  data.records.forEach(r => {
    let d = new Date(r.fields.Entrada), s = new Date(r.fields.Salida);
    const c = r.fields["Número de Cupos"]||0;
    while (d <= s) {
      const key = d.toISOString().split("T")[0];
      map[key] = (map[key]||0) + c;
      d.setDate(d.getDate()+1);
    }
  });
  return map;
}

// al final de agenda.js:
window.mostrarEntradas = mostrarEntradas;
window.mostrarSalidas = mostrarSalidas;
window.verificarDisponibilidad = verificarDisponibilidad;
