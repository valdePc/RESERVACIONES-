// translations.js

const translations = {
    es: {
      login: {
        title: "Acceso a Reservaciones",
        header: "Acceso a Reservaciones",
        selectDefault: "Seleccione su nombre",
        passwordPlaceholder: "Ingrese su contraseña",
        togglePasswordAria: "Mostrar contraseña",
        button: "Ingresar",
        error: "Contraseña incorrecta. Inténtalo de nuevo."
      },
      agenda: {
        headerTitle: "Agenda de Reservaciones",
        settingsAria: "Configuración",
        labelChangeLogo: "Cambiar logo",
        textChangeTheme: "Cambiar tema",
        buttonUpdatePassword: "Actualizar contraseña",
        textLogout: "Cerrar sesión",
        labelLanguage: "Idioma",
        optionSpanish: "Español",
        optionEnglish: "English",
        optionGerman: "Deutsch",
        legendDates: "Fechas",
        legendDetails: "Detalles de la reserva",
        legendAdditional: "Información adicional",
        labelRegistroDate: "Fecha de registro",
        labelEntrada: "Entrada",
        labelSalida: "Salida",
        labelLocation: "Ubicación NPH",
        placeholderLocation: "Ingrese la ubicación",
        labelCupos: "Número de cupos",
        placeholderCupos: "0",
        labelPersonas: "Número de personas",
        placeholderPersonas: "0",
        labelContacto: "Contacto",
        placeholderContacto: "Nombre",
        labelVuelo: "Vuelo (opcional)",
        placeholderVuelo: "Número de vuelo",
        labelComentario: "Comentario",
        placeholderComentario: "Escribe un comentario…",
        availabilityText: "Espacios ocupados hoy: {occ} / Espacios disponibles: {avail}",
        buttonSave: "Guardar",
        buttonEntradas: "Entradas",
        buttonSalidas: "Salidas",
        buttonAvailability: "Disponibilidad",
        navStatistics: "Estadística",
        navBDD: "BDD",
        navTransport: "Transporte",
        tableTitle: "Estado de Reservaciones",
        thRegistro: "Registro",
        thEntrada: "Entrada",
        thSalida: "Salida",
        thUbicacion: "Ubicación",
        thCupos: "Cupos",
        thPersonas: "Personas",
        thContacto: "Contacto",
        thVuelo: "Vuelo",
        thComentario: "Comentario",
        thAccion: "Acción",
        footer: "© 2025 Reservaciones NPH & OWS."
      },
      stats: {
        title: "Base de Datos - Estadísticas",
        header: "Estadísticas de Reservaciones",
        totalReservations: "Total de Reservaciones",
        currentOccupancy: "Personas Ocupando Actuales",
        avgPerDay: "Reservaciones Promedio por Día",
        totalPeople: "Total de Personas Reservadas",
        totalCupos: "Total de Cupos Reservados",
        chartByMonth: "Reservaciones por Mes",
        chartByLocation: "Cupos Ocupados por Ubicación",
        detailsHeader: "Detalles de Reservaciones",
        thRegistro: "Registro",
        thEntrada: "Entrada",
        thSalida: "Salida",
        thUbicacion: "Ubicación",
        thCupos: "Cupos",
        thPersonas: "Personas",
        thContacto: "Contacto",
        thVuelo: "Vuelo",
        thComentario: "Comentario"
      },
      transport: {
        header: "Gestión de Transporte",
        labelRegistroFecha: "Fecha de Registro",
        labelViajeFecha: "Fecha de Viaje",
        labelTipoViaje: "Tipo de Viaje",
        optionDefaultTipo: "Seleccione una opción",
        optionLlegada: "Llegada",
        optionSalida: "Salida",
        labelHoraViaje: "Hora del Viaje",
        labelDestinoInicial: "Destino Inicial",
        placeholderDestinoInicial: "Seleccione o escriba un destino",
        labelDestinoFinal: "Destino Final",
        placeholderDestinoFinal: "Seleccione o escriba un destino",
        labelNumPersonas: "Número de Personas",
        placeholderNumPersonas: "Ingrese el número de personas",
        labelChofer: "Chofer",
        optionDefaultChofer: "Seleccione un chofer",
        optionChoferHenry: "Henrry",
        optionChoferDomingo: "Domingo",
        optionChoferJuan: "Juan",
        optionChoferOtro: "Otro",
        labelComentarios: "Comentarios Adicionales",
        placeholderComentarios: "Escriba comentarios adicionales",
        buttonSave: "Guardar",
        buttonBackAria: "Volver",
        tableHeader: "Transporte Registrado",
        thRegistroFecha: "Fecha Registro",
        thViajeFecha: "Fecha Viaje",
        thHora: "Hora",
        thTipo: "Tipo",
        thDestinoInicial: "Destino Inicial",
        thDestinoFinal: "Destino Final",
        thNumPersonas: "Número de Personas",
        thChofer: "Chofer",
        thComentarios: "Comentarios"
      },
      // translations.js (dentro de translations.es, translations.en y translations.de)
chatCommands: {
    // SALUDO
    saludo: [
      "hola",    // es
      "hello",   // en
      "hallo"    // de
    ],
  
    // ENTRADAS (check-in)
    entradas: [
      "entrada",    // es
      "entradas",
      "check in",      // en
      "Check in",
      "Ankünfte",    // de singular sin diéresis
      "Ankunfte", 
      "ankünfte", 
      "ankünfte"   // de plural "eingänge" normalizado
    ],
  
    // SALIDAS (check-out)
    salidas: [
      "salida",     // es
      "salidas",
      "check out",       // en
      "Check out",
      "Abreisen",    // de singular
      "abreisen"   // de plural "ausgänge" normalizado
    ],
  
    // DISPONIBILIDAD
    disponibilidad: [
      "disponibilidad",   // es
      "availability",     // en
      "verfugbarkeit", 
      "verfugbarkeit",    // de sin diéresis
      "Verfügbarkeit",  
      "verfügbarkeit"     // (ya normalizado)
      
    ]
  }
  
    },
  
    en: {
      login: {
        title: "Reservation Login",
        header: "Reservation Login",
        selectDefault: "Select your name",
        passwordPlaceholder: "Enter your password",
        togglePasswordAria: "Show password",
        button: "Log In",
        error: "Incorrect password. Try again."
      },
      agenda: {
        headerTitle: "Reservation Schedule",
        settingsAria: "Settings",
        labelChangeLogo: "Change logo",
        textChangeTheme: "Change theme",
        buttonUpdatePassword: "Update password",
        textLogout: "Log out",
        labelLanguage: "Language",
        optionSpanish: "Español",
        optionEnglish: "English",
        optionGerman: "Deutsch",
        legendDates: "Dates",
        legendDetails: "Reservation Details",
        legendAdditional: "Additional Information",
        labelRegistroDate: "Registration Date",
        labelEntrada: "Check In",
        labelSalida: "Check Out",
        labelLocation: "Location",
        placeholderLocation: "Enter location",
        labelCupos: "Number of slots",
        placeholderCupos: "0",
        labelPersonas: "Number of people",
        placeholderPersonas: "0",
        labelContacto: "Contact",
        placeholderContacto: "Name",
        labelVuelo: "Flight (optional)",
        placeholderVuelo: "Flight number",
        labelComentario: "Comment",
        placeholderComentario: "Write a comment…",
        availabilityText: "Spaces occupied today: {occ} / Available spaces: {avail}",
        buttonSave: "Save",
        buttonEntradas: "Check In",
        buttonSalidas: "Check Out",
        buttonAvailability: "Availability",
        navStatistics: "Statistics",
        navBDD: "DB",
        navTransport: "Transport",
        tableTitle: "Reservation Status",
        thRegistro: "Registration",
        thEntrada: "Check‑in",
        thSalida: "Check‑out",
        thUbicacion: "Location",
        thCupos: "Slots",
        thPersonas: "People",
        thContacto: "Contact",
        thVuelo: "Flight",
        thComentario: "Comment",
        thAccion: "Action",
        footer: "© 2025 NPH & OWS Reservations."
      },
      stats: {
        title: "Database - Statistics",
        header: "Reservation Statistics",
        totalReservations: "Total Reservations",
        currentOccupancy: "Current Occupancy",
        avgPerDay: "Avg. Reservations/Day",
        totalPeople: "Total People Booked",
        totalCupos: "Total Slots Booked",
        chartByMonth: "Reservations by Month",
        chartByLocation: "Slots by Location",
        detailsHeader: "Reservation Details",
        thRegistro: "Registration",
        thEntrada: "Check‑in",
        thSalida: "Check‑out",
        thUbicacion: "Location",
        thCupos: "Slots",
        thPersonas: "People",
        thContacto: "Contact",
        thVuelo: "Flight",
        thComentario: "Comment"
      },
      transport: {
        header: "Transport Management",
        labelRegistroFecha: "Registration Date",
        labelViajeFecha: "Travel Date",
        labelTipoViaje: "Trip Type",
        optionDefaultTipo: "Select an option",
        optionLlegada: "Arrival",
        optionSalida: "Departure",
        labelHoraViaje: "Travel Time",
        labelDestinoInicial: "Start Destination",
        placeholderDestinoInicial: "Select or type a destination",
        labelDestinoFinal: "End Destination",
        placeholderDestinoFinal: "Select or type a destination",
        labelNumPersonas: "Number of People",
        placeholderNumPersonas: "Enter number of people",
        labelChofer: "Driver",
        optionDefaultChofer: "Select a driver",
        optionChoferHenry: "Henry",
        optionChoferDomingo: "Domingo",
        optionChoferJuan: "Juan",
        optionChoferOtro: "Other",
        labelComentarios: "Additional Comments",
        placeholderComentarios: "Write additional comments",
        buttonSave: "Save",
        buttonBackAria: "Back",
        tableHeader: "Registered Transport",
        thRegistroFecha: "Registration",
        thViajeFecha: "Date",
        thHora: "Time",
        thTipo: "Type",
        thDestinoInicial: "From",
        thDestinoFinal: "To",
        thNumPersonas: "People",
        thChofer: "Driver",
        thComentarios: "Comments"
      }
    },
  
    de: {
      login: {
        title: "Reservierungszugang",
        header: "Reservierungszugang",
        selectDefault: "Wählen Sie Ihren Namen",
        passwordPlaceholder: "Passwort eingeben",
        togglePasswordAria: "Passwort anzeigen",
        button: "Einloggen",
        error: "Falsches Passwort. Versuchen Sie es erneut."
      },
      agenda: {
        headerTitle: "Reservierungsplan",
        settingsAria: "Einstellungen",
        labelChangeLogo: "Logo ändern",
        textChangeTheme: "Thema ändern",
        buttonUpdatePassword: "Passwort aktualisieren",
        textLogout: "Abmelden",
        labelLanguage: "Sprache",
        optionSpanish: "Español",
        optionEnglish: "English",
        optionGerman: "Deutsch",
        legendDates: "Daten",
        legendDetails: "Reservierungsdetails",
        legendAdditional: "Zusätzliche Informationen",
        labelRegistroDate: "Registrierungsdatum",
        labelEntrada: "Anreise",
        labelSalida: "Abreise",
        labelLocation: "Ort",
        placeholderLocation: "Ort eingeben",
        labelCupos: "Anzahl Plätze",
        placeholderCupos: "0",
        labelPersonas: "Personenanzahl",
        placeholderPersonas: "0",
        labelContacto: "Kontakt",
        placeholderContacto: "Name",
        labelVuelo: "Flug (optional)",
        placeholderVuelo: "Flugnummer",
        labelComentario: "Kommentar",
        placeholderComentario: "Schreibe einen Kommentar…",
        availabilityText: "Plätze heute belegt: {occ} / Verfügbare Plätze: {avail}",
        buttonSave: "Speichern",
        buttonEntradas: "Ankünfte",
        buttonSalidas: "Abreisen",
        buttonAvailability: "Verfügbarkeit",
        navStatistics: "Statistik",
        navBDD: "DB",
        navTransport: "Transport",
        tableTitle: "Reservierungsstatus",
        thRegistro: "Registrierung",
        thEntrada: "Anreise",
        thSalida: "Abreise",
        thUbicacion: "Ort",
        thCupos: "Plätze",
        thPersonas: "Personen",
        thContacto: "Kontakt",
        thVuelo: "Flug",
        thComentario: "Kommentar",
        thAccion: "Aktion",
        footer: "© 2025 NPH & OWS Reservierungen"
      },
      stats: {
        title: "Datenbank – Statistik",
        header: "Reservierungsstatistik",
        totalReservations: "Gesamtreservierungen",
        currentOccupancy: "Aktuelle Belegung",
        avgPerDay: "Ø Reservierungen / Tag",
        totalPeople: "Gesamt Personen",
        totalCupos: "Gesamt Plätze",
        chartByMonth: "Reservierungen pro Monat",
        chartByLocation: "Belegte Plätze nach Ort",
        detailsHeader: "Reservierungsdetails",
        thRegistro: "Registrierung",
        thEntrada: "Anreise",
        thSalida: "Abreise",
        thUbicacion: "Ort",
        thCupos: "Plätze",
        thPersonas: "Personen",
        thContacto: "Kontakt",
        thVuelo: "Flug",
        thComentario: "Kommentar"
      },
      transport: {
        header: "Transportverwaltung",
        labelRegistroFecha: "Registrierungsdatum",
        labelViajeFecha: "Reisedatum",
        labelTipoViaje: "Reiseart",
        optionDefaultTipo: "Bitte wählen",
        optionLlegada: "Ankunft",
        optionSalida: "Abreise",
        labelHoraViaje: "Reisezeit",
        labelDestinoInicial: "Startziel",
        placeholderDestinoInicial: "Ziel auswählen oder eingeben",
        labelDestinoFinal: "Ziel",
        placeholderDestinoFinal: "Ziel auswählen oder eingeben",
        labelNumPersonas: "Personenanzahl",
        placeholderNumPersonas: "Anzahl eingeben",
        labelChofer: "Fahrer",
        optionDefaultChofer: "Fahrer auswählen",
        optionChoferHenry: "Henry",
        optionChoferDomingo: "Domingo",
        optionChoferJuan: "Juan",
        optionChoferOtro: "Andere",
        labelComentarios: "Zusätzliche Kommentare",
        placeholderComentarios: "Kommentare schreiben",
        buttonSave: "Speichern",
        buttonBackAria: "Zurück",
        tableHeader: "Registrierte Transporte",
        thRegistroFecha: "Datum",
        thViajeFecha: "Reise",
        thHora: "Zeit",
        thTipo: "Art",
        thDestinoInicial: "Start",
        thDestinoFinal: "Ziel",
        thNumPersonas: "Personen",
        thChofer: "Fahrer",
        thComentarios: "Kommentare"
      }
    }
  };
  
  // Asegúrate de cargar este archivo (translations.js) antes de tus otros scripts:
  //   <script src="translations.js"></script>
  //   <script src="agenda.js"></script>
  //   <script src="estadistica.js"></script>
  //   <script src="transporte.js"></script>
  let currentLang = localStorage.getItem('lang') || 'es';

export function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  // Actualiza el atributo lang en <html>
  document.documentElement.lang = lang;
  applyTranslations();
}

export function t(key, ...args) {
  const entry = key
    .split('.')
    .reduce((o, i) => o?.[i], translations[currentLang]);
  return typeof entry === 'function'
    ? entry(...args)
    : entry || key;
}

export function applyTranslations() {
  // Asegura que <html> tenga el idioma correcto
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const raw = el.getAttribute('data-i18n');
    let args = [];
    if (el.dataset.args) {
      try {
        args = JSON.parse(el.dataset.args);
      } catch {
        console.warn('JSON inválido en data-args:', el.dataset.args);
      }
    }
    const txt = t(raw, ...args);
    if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && 'placeholder' in el) {
      el.placeholder = txt;
    } else {
      el.textContent = txt;
    }
  });
}
