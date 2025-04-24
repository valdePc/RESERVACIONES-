// estadistica.js
import { t } from './translations.js';  // asume translations.js exporta la función t()

const apiKey    = 'patL0v30ZFJzTux8W.c464296609147a785c6cfd6ccb96863088259df68518b69e56000c44eb73f0f0';
const baseId    = 'appLJWGTQ6xFXTRDl';
const tableName = 'Reservas';

document.addEventListener("DOMContentLoaded", async () => {
  const data = await fetchReservations();
  updateStats(data);
  renderTable(data);
  renderCharts(data);
});

async function fetchReservations() {
  const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const json = await response.json();
  return json.records.map(r => r.fields);
}

function updateStats(data) {
  const totalReservations = data.length;
  const today = new Date();

  const currentOccupancy = data.reduce((sum, item) => {
    const entrada = new Date(item.Entrada);
    const salida  = new Date(item.Salida);
    return (entrada <= today && salida >= today)
      ? sum + (item['Número de Personas'] || 0)
      : sum;
  }, 0);

  const avgReservations = (totalReservations / today.getDate()).toFixed(2);
  const totalPeople     = data.reduce((sum, i) => sum + (i['Número de Personas'] || 0), 0);
  const totalCupos      = data.reduce((sum, i) => sum + (i['Número de Cupos']    || 0), 0);

  document.getElementById("total-reservations").textContent = totalReservations;
  document.getElementById("current-occupancy").textContent  = currentOccupancy;
  document.getElementById("avg-reservations").textContent   = avgReservations;
  document.getElementById("total-people").textContent      = totalPeople;
  document.getElementById("total-cupos").textContent       = totalCupos;
}

function renderTable(data) {
  const tbody = document.querySelector("#reservationsTable tbody");
  tbody.innerHTML = "";
  data.forEach(item => {
    const row = tbody.insertRow();
    row.insertCell().textContent = item['Fecha de Registro'] || "-";
    row.insertCell().textContent = item.Entrada   || "-";
    row.insertCell().textContent = item.Salida    || "-";
    row.insertCell().textContent = item.Locación || "-";
    row.insertCell().textContent = item['Número de Cupos']    || "-";
    row.insertCell().textContent = item['Número de Personas'] || "-";
    row.insertCell().textContent = item.Contacto   || "-";
    row.insertCell().textContent = item.Vuelo      || "-";
    row.insertCell().textContent = item.Comentario || "-";
  });
}

function renderCharts(data) {
  const lang = localStorage.getItem("language") || "es";

  // --- Reservaciones por mes ---
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString(lang, { month: 'long' })
  );
  const byMonth = Array(12).fill(0);
  data.forEach(item => {
    const m = new Date(item.Entrada).getMonth();
    if (!isNaN(m)) byMonth[m]++;
  });

  new Chart(
    document.getElementById('monthlyChart'),
    {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          data: byMonth
          // los colores los define CSS o defaults
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: t('stats.chartByMonth')
          }
        }
      }
    }
  );

  // --- Cupos por ubicación ---
  const locs = {};
  let totalCupos = 0;
  data.forEach(item => {
    const loc = item.Locación;
    const cup = item['Número de Cupos'] || 0;
    if (loc && cup > 0) {
      locs[loc] = (locs[loc] || 0) + cup;
      totalCupos += cup;
    }
  });

  new Chart(
    document.getElementById('locationChart'),
    {
      type: 'pie',
      data: {
        labels: Object.keys(locs),
        datasets: [{
          data: Object.values(locs)
        }]
      },
      options: {
        responsive: true,
        plugins: {
          datalabels: {
            formatter: (value) => ((value / totalCupos) * 100).toFixed(1) + '%',
            // usa estilos por defecto para que contraste según tema
          },
          legend: { position: 'top' },
          title: {
            display: true,
            text: t('stats.chartByLocation')
          }
        }
      },
      plugins: [ChartDataLabels]
    }
  );
}
