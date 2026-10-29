
"use strict";

/* =========================================
   ACCESIA - DASHBOARD INSTITUCIONAL
========================================= */

const raiz = document.documentElement;
const estado = document.getElementById("estado-accesible");

const seccionDashboard =
  document.getElementById("vista-dashboard");

const seccionBeneficiarios =
  document.getElementById("vista-beneficiarios");  

const seccionModulo =
  document.getElementById("vista-modulo");

const tituloSuperior =
  document.getElementById("titulo-superior");

let escalaTexto = 100;
let ultimoTexto = "";

/* =========================================
   UTILIDADES
========================================= */

function elemento(id) {
  return document.getElementById(id);
}

function anunciar(texto) {
  estado.textContent = texto;
}

function almacenamiento(operacion) {
  try {
    return operacion();
  } catch (error) {
    return null;
  }
}

/* =========================================
   INFORMACIÓN DE LA INSTITUCIÓN
========================================= */

async function cargarInstitucion() {
  try {
    const respuesta = await fetch(
      "/api/instituciones/mi-perfil",
      {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store"
      }
    );

    if (
      respuesta.status === 401 ||
      respuesta.status === 403
    ) {
      window.location.replace(
        "/login-institucion.html"
      );
      return;
    }

    if (!respuesta.ok) {
      throw new Error(
        "No fue posible consultar el perfil institucional."
      );
    }

    const institucion = await respuesta.json();

    elemento("institucion-nombre").textContent =
      institucion.razonSocial || "Institución";

    elemento("institucion-ruc").textContent =
      institucion.ruc
        ? "RUC: " + institucion.ruc
        : "";

    elemento("usuario-nombre").textContent =
      institucion.nombreResponsable ||
      "Administrador institucional";

    elemento("usuario-correo").textContent =
      institucion.email || "Cuenta institucional";

  } catch (error) {
    elemento("institucion-nombre").textContent =
      "Información no disponible";

    elemento("usuario-correo").textContent =
      "No se pudo cargar el perfil";

    anunciar(error.message);
  }
}

/* =========================================
   NAVEGACIÓN ENTRE MÓDULOS
========================================= */

const modulos = {
  dashboard: {
    titulo: "Dashboard institucional",
    descripcion: ""
  },

  beneficiarios: {
    titulo: "Beneficiarios",
    descripcion:
      "Registra, consulta y administra a las personas " +
      "beneficiarias de los servicios de tu institución."
  },

  servicios: {
    titulo: "Servicios",
    descripcion:
      "Organiza los servicios de apoyo disponibles " +
      "para personas con discapacidad visual."
  },

  personal: {
    titulo: "Personal",
    descripcion:
      "Gestiona a los profesionales y colaboradores " +
      "responsables de brindar atención."
  },

  solicitudes: {
    titulo: "Solicitudes",
    descripcion:
      "Consulta, revisa y gestiona las solicitudes " +
      "de apoyo recibidas por tu institución."
  },

  asignaciones: {
    titulo: "Asignaciones",
    descripcion:
      "Asigna personal y recursos para la atención " +
      "de las solicitudes institucionales."
  },

  seguimiento: {
    titulo: "Seguimiento",
    descripcion:
      "Supervisa el avance y los resultados de las atenciones."
  },

  reportes: {
    titulo: "Reportes",
    descripcion:
      "Visualiza indicadores y reportes sobre " +
      "los servicios y la atención institucional."
  },

  planes: {
    titulo: "Planes y suscripciones",
    descripcion:
      "Consulta los planes y la suscripción " +
      "asociada con tu institución."
  }
};

function abrirModulo(nombre) {
  const configuracion = modulos[nombre];

  if (!configuracion) return;

  const esDashboard = nombre === "dashboard";

  const esBeneficiarios = nombre === "beneficiarios";

seccionDashboard.hidden = !esDashboard;
seccionBeneficiarios.hidden = !esBeneficiarios;

seccionModulo.hidden =
  esDashboard || esBeneficiarios;

  tituloSuperior.textContent =
    configuracion.titulo;

  if (!esDashboard) {
    elemento("titulo-modulo").textContent =
      configuracion.titulo;

    elemento("descripcion-modulo").textContent =
      configuracion.descripcion;
  }

  document.querySelectorAll(".sidebar-nav .nav-item")
    .forEach(boton => {

      const activo =
        boton.dataset.view === nombre;

      boton.classList.toggle("active", activo);

      if (activo) {
        boton.setAttribute("aria-current", "page");
      } else {
        boton.removeAttribute("aria-current");
      }
    });

  anunciar(
    "Vista seleccionada: " + configuracion.titulo
  );

  elemento("contenido").focus({
    preventScroll: true
  });

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });
}

document.addEventListener("click", evento => {
  const boton = evento.target.closest("[data-view]");

  if (boton) {
    abrirModulo(boton.dataset.view);
  }
});

/* =========================================
   MODO CLARO Y OSCURO
========================================= */

const botonTema = elemento("tema");

const temaGuardado = almacenamiento(() =>
  localStorage.getItem("accesia-theme")
);

raiz.dataset.theme =
  temaGuardado === "light" ? "light" : "dark";

function actualizarTema() {
  const claro = raiz.dataset.theme === "light";

  botonTema.textContent =
    claro ? "Modo oscuro" : "Modo claro";

  botonTema.setAttribute(
    "aria-label",
    claro
      ? "Activar modo oscuro"
      : "Activar modo claro"
  );
}

actualizarTema();

botonTema.addEventListener("click", () => {
  raiz.dataset.theme =
    raiz.dataset.theme === "dark"
      ? "light"
      : "dark";

  almacenamiento(() =>
    localStorage.setItem(
      "accesia-theme",
      raiz.dataset.theme
    )
  );

  actualizarTema();

  anunciar(
    "Tema " + raiz.dataset.theme + " activado."
  );
});

/* =========================================
   ALTO CONTRASTE
========================================= */

elemento("contraste").addEventListener("click", () => {
  const activo =
    raiz.classList.toggle("high-contrast");

  elemento("contraste").setAttribute(
    "aria-pressed",
    String(activo)
  );

  anunciar(
    activo
      ? "Alto contraste activado."
      : "Alto contraste desactivado."
  );
});

/* =========================================
   TAMAÑO DEL TEXTO
========================================= */

elemento("mas-texto").addEventListener("click", () => {
  escalaTexto = Math.min(140, escalaTexto + 10);
  raiz.style.fontSize = escalaTexto + "%";

  anunciar(
    "Texto aumentado al " + escalaTexto + " por ciento."
  );
});

elemento("menos-texto").addEventListener("click", () => {
  escalaTexto = Math.max(90, escalaTexto - 10);
  raiz.style.fontSize = escalaTexto + "%";

  anunciar(
    "Texto ajustado al " + escalaTexto + " por ciento."
  );
});

/* =========================================
   LECTURA DE VOZ
========================================= */

const vozDisponible =
  "speechSynthesis" in window;

const botonEscuchar = elemento("escuchar");
const botonPausar = elemento("pausar");

if (!vozDisponible) {
  botonEscuchar.disabled = true;
  botonPausar.disabled = true;

} else {

  botonEscuchar.addEventListener("click", () => {
    const motor = window.speechSynthesis;

    if (motor.speaking || motor.paused) {
      motor.cancel();
      botonPausar.textContent = "Pausar / Repetir";
      return;
    }

    const titulo = tituloSuperior.textContent;

    const contenido =
      seccionDashboard.hidden
        ? elemento("descripcion-modulo").textContent
        : "Gestiona beneficiarios, servicios, solicitudes, " +
          "personal, asignaciones, seguimiento, " +
          "reportes, planes y suscripciones.";

    ultimoTexto =
      "AccesIA. " + titulo + ". " + contenido;

    const lectura =
      new SpeechSynthesisUtterance(ultimoTexto);

    lectura.lang = "es-PE";
    lectura.rate = 0.95;

    lectura.onend = () => {
      botonPausar.textContent = "Pausar / Repetir";
    };

    motor.speak(lectura);
  });

  botonPausar.addEventListener("click", () => {
    const motor = window.speechSynthesis;

    if (motor.paused) {
      motor.resume();
      botonPausar.textContent = "Pausar / Repetir";

    } else if (motor.speaking) {
      motor.pause();
      botonPausar.textContent = "Reanudar";

    } else if (ultimoTexto) {
      const lectura =
        new SpeechSynthesisUtterance(ultimoTexto);

      lectura.lang = "es-PE";
      motor.speak(lectura);
    }
  });

  window.addEventListener("pagehide", () => {
    window.speechSynthesis.cancel();
  });
}

/* =========================================
   AYUDA
========================================= */

const dialogo = elemento("dialogo-ayuda");

elemento("ayuda").addEventListener("click", () => {
  dialogo.showModal();
});

/* =========================================
   CERRAR SESIÓN REAL
========================================= */

elemento("cerrar-sesion")
  .addEventListener("click", async () => {

    const boton = elemento("cerrar-sesion");
    boton.disabled = true;

    anunciar("Cerrando sesión institucional.");

    try {
      // Obtener el token CSRF vigente.
      const respuestaToken = await fetch(
        "/api/auth/csrf",
        {
          credentials: "same-origin",
          cache: "no-store"
        }
      );

      if (!respuestaToken.ok) {
        throw new Error(
          "No se pudo obtener el token de seguridad."
        );
      }

      const csrf = await respuestaToken.json();

      // Cerrar la sesión administrada por Spring Security.
      const respuesta = await fetch("/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          [csrf.headerName]: csrf.token
        }
      });

      if (!respuesta.ok) {
        throw new Error(
          "El servidor no pudo cerrar la sesión."
        );
      }

      // Salir del panel protegido.
      window.location.replace(
        "/login-institucion.html"
      );

    } catch (error) {
      anunciar(error.message);
      alert(error.message);
      boton.disabled = false;
    }
  });

/* =========================================
   INICIALIZACIÓN
========================================= */

cargarInstitucion();
