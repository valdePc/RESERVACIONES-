// index.js
import { applyTranslations, t } from './translations.js';

// AHORA (lee desde window._env):
const apiKey    = window._env.AIRTABLE_API_KEY;
const baseId    = window._env.AIRTABLE_BASE_ID;

const tableName = 'Contraseñas'; // si este no cambia, puede quedar así

const nombresSelect  = document.getElementById("nombres");
const passwordInput  = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginBtn       = document.getElementById("loginBtn");
const errorMsg       = document.getElementById("error");
const loadingSpinner = document.querySelector(".loading");
const loginLogoEl    = document.getElementById("loginLogo");
const profilePicEl   = document.getElementById("profilePic");

let usersCache = [];

window.addEventListener('DOMContentLoaded', () => {
  applyTranslations();

  const savedLogo = localStorage.getItem('loginLogo');
  if (savedLogo) loginLogoEl.src = savedLogo;

  cargarNombres();

  nombresSelect.addEventListener('change', () => {
    const selName = nombresSelect.value;
    const rec = usersCache.find(r => r.fields.Name === selName);
    if (!rec || !rec.fields.Foto) {
      profilePicEl.src = 'images/default-profile.png';
    } else {
      const url = Array.isArray(rec.fields.Foto)
        ? rec.fields.Foto[0].url
        : rec.fields.Foto;
      profilePicEl.src = url;
    }
    localStorage.setItem('currentUserId', rec?.id || "");
    localStorage.setItem('currentUserName', selName);
  });

  loginBtn.addEventListener("click", verificarContraseña);
  togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    // no cambiamos el icono, solo actualizamos aria-label
    togglePassword.setAttribute('aria-label', t('login.togglePasswordAria'));
  });
});

async function cargarNombres() {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const { records } = await res.json();
    usersCache = records;
    records.forEach(r => {
      const opt = document.createElement("option");
      opt.value = opt.textContent = r.fields.Name;
      nombresSelect.append(opt);
    });
  } catch (e) {
    console.error("Error cargando nombres:", e);
    alert(t('login.serverError'));
  }
}

async function verificarContraseña() {
  const nombre = nombresSelect.value;
  const pwd    = passwordInput.value;
  errorMsg.style.display       = 'none';
  loadingSpinner.style.display = 'flex';

  try {
    const filter = encodeURIComponent(`{Name}='${nombre}'`);
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=${filter}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    const { records } = await res.json();
    loadingSpinner.style.display = 'none';

    if (records.length && records[0].fields.Contraseña === pwd) {
      localStorage.setItem('currentUserId', records[0].id);
      localStorage.setItem('currentUserName', nombre);
      window.location.href = "agenda.html";
    } else {
      errorMsg.textContent = records.length
        ? t('login.error')
        : t('login.userNotFound');
      errorMsg.style.display = 'block';
    }
  } catch (e) {
    loadingSpinner.style.display = 'none';
    console.error("Login error:", e);
    errorMsg.textContent   = t('login.serverError');
    errorMsg.style.display = 'block';
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .catch(err => console.error('Error SW:', err));
}
document.addEventListener('gesturestart', e => e.preventDefault());
