
"use strict";

/* ========================================
   ACCESIA - REGISTRO INSTITUCIONAL
======================================== */

const raiz = document.documentElement;

const formulario = document.getElementById("formulario");
const pasos = [...document.querySelectorAll(".reg-form-step")];
const indicadores = [...document.querySelectorAll(".reg-steps li")];

const botonAnterior = document.getElementById("anterior");
const botonSiguiente = document.getElementById("siguiente");
const botonRegistrar = document.getElementById("registrar");

const mensajeRegistro = document.getElementById("mensaje-registro");

let pasoActual = 0;
let escalaTexto = 100;
let registroCompletado = false;

/* ========================================
   UTILIDADES
======================================== */

function obtener(id) {
  return document.getElementById(id);
}

function texto(id) {
  return obtener(id).value.trim();
}

function guardarPreferencia(accion) {
  try {
    return accion();
  } catch (error) {
    return null;
  }
}

function mostrarMensaje(mensaje, tipo = "") {
  mensajeRegistro.textContent = mensaje;
  mensajeRegistro.hidden = !mensaje;
  mensajeRegistro.className =
    "reg-status" + (tipo ? " " + tipo : "");

  if (mensaje) {
    mensajeRegistro.focus();
  }
}

/* ========================================
   NAVEGACIÓN ENTRE PASOS
======================================== */

function actualizarResumen() {
  obtener("resumen-correo").textContent =
    texto("email") || "—";

  obtener("revision-razon").textContent =
    texto("razonSocial") || "—";

  obtener("revision-ruc").textContent =
    texto("ruc") || "—";

  const nombre = [
    texto("nombres"),
    texto("apellidos")
  ].filter(Boolean).join(" ");

  obtener("revision-admin").textContent = nombre || "—";

  obtener("revision-email").textContent =
    texto("email") || "—";
}

function mostrarPaso(numero) {
  pasoActual = numero;

  pasos.forEach((paso, indice) => {
    paso.hidden = indice !== numero;
  });

  indicadores.forEach((indicador, indice) => {
    indicador.classList.toggle(
      "active",
      indice === numero
    );

    if (indice === numero) {
      indicador.setAttribute("aria-current", "step");
    } else {
      indicador.removeAttribute("aria-current");
    }
  });

  const porcentaje = Math.round(
    ((numero + 1) / pasos.length) * 100
  );

  obtener("barra-progreso").style.width =
    porcentaje + "%";

  obtener("texto-progreso").textContent =
    `Progreso del registro: Paso ${numero + 1} de 3 (${porcentaje}%)`;

  botonAnterior.hidden = numero === 0;
  botonSiguiente.hidden = numero === 2;
  botonRegistrar.hidden = numero !== 2;

  if (numero < 2) {
    botonSiguiente.firstChild.textContent =
      `Continuar al Paso ${numero + 2} `;
  }

  actualizarResumen();
  mostrarMensaje("");

  const titulo = pasos[numero].querySelector("h2");

  titulo.setAttribute("tabindex", "-1");
  titulo.focus({ preventScroll: true });

  obtener("pasos-registro").scrollIntoView({
    behavior: "instant",
    block: "start"
  });
}

/* ========================================
   VALIDACIÓN
======================================== */

function validarPaso(numero) {
  const seccion = pasos[numero];

  // Comprobar coincidencia de contraseñas.
  if (numero === 2) {
    const clave = obtener("contrasena");
    const confirmar = obtener("confirmar");

    confirmar.setCustomValidity(
      confirmar.value && confirmar.value !== clave.value
        ? "Las contraseñas no coinciden."
        : ""
    );
  }

  const campos = seccion.querySelectorAll(
    "input, select"
  );

  for (const campo of campos) {
    if (!campo.checkValidity()) {
      campo.setAttribute("aria-invalid", "true");
      campo.reportValidity();
      campo.focus();
      return false;
    }

    campo.removeAttribute("aria-invalid");
  }

  return true;
}

formulario.addEventListener("input", (evento) => {
  if (evento.target.matches("input, select")) {
    evento.target.removeAttribute("aria-invalid");
  }

  obtener("confirmar").setCustomValidity("");
});

/* ========================================
   VERIFICAR FORMATO DEL RUC
======================================== */

obtener("validar-ruc").addEventListener("click", () => {
  const ruc = texto("ruc");

  if (!/^\d{11}$/.test(ruc)) {
    obtener("estado-ruc").textContent =
      "El RUC debe contener exactamente 11 dígitos.";

    obtener("ruc").setAttribute(
      "aria-invalid", "true"
    );

    obtener("ruc").reportValidity();
    obtener("ruc").focus();
    return;
  }

  obtener("ruc").removeAttribute("aria-invalid");

  obtener("estado-ruc").textContent =
    "Formato correcto: 11 dígitos. " +
    "No se ha realizado una consulta oficial a SUNAT.";
});

/* ========================================
   BOTONES ANTERIOR Y SIGUIENTE
======================================== */

botonSiguiente.addEventListener("click", () => {
  if (validarPaso(pasoActual) && pasoActual < 2) {
    mostrarPaso(pasoActual + 1);
  }
});

botonAnterior.addEventListener("click", () => {
  if (pasoActual > 0) {
    mostrarPaso(pasoActual - 1);
  }
});

obtener("editar-institucion")
  .addEventListener("click", () => {
    mostrarPaso(0);
  });

/* ========================================
   MOSTRAR Y OCULTAR CONTRASEÑAS
======================================== */

document.querySelectorAll("[data-toggle-password]")
  .forEach((boton) => {

    boton.addEventListener("click", () => {
      const campo = obtener(
        boton.dataset.togglePassword
      );

      const visible = campo.type === "password";

      campo.type = visible ? "text" : "password";
      boton.textContent = visible ? "Ocultar" : "Mostrar";

      boton.setAttribute(
        "aria-pressed",
        String(visible)
      );

      boton.setAttribute(
        "aria-label",
        visible
          ? "Ocultar contraseña"
          : "Mostrar contraseña"
      );
    });
  });

/* ========================================
   ENVÍO REAL A SPRING BOOT
======================================== */

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  if (registroCompletado) return;

  // Revisar todos los pasos antes de enviar.
  for (let indice = 0; indice < pasos.length; indice++) {
    if (pasoActual !== indice) {
      mostrarPaso(indice);
    }

    if (!validarPaso(indice)) {
      return;
    }
  }

  // El backend guarda un nombre completo.
  const nombreResponsable = [
    texto("nombres"),
    texto("apellidos")
  ].join(" ").trim();

  const datos = {
    razonSocial: texto("razonSocial"),
    ruc: texto("ruc"),
    tipoInstitucion: texto("tipoInstitucion"),
    nombreResponsable,
    cargoResponsable: texto("cargoResponsable"),
    telefono: texto("telefono"),
    direccion: texto("direccion"),
    region: texto("region"),
    provincia: texto("provincia"),
    distrito: texto("distrito"),
    email: texto("email"),
    contrasena: obtener("contrasena").value
  };

  botonRegistrar.disabled = true;
  botonRegistrar.textContent = "Registrando...";

  mostrarMensaje(
    "Procesando el registro institucional..."
  );

  try {
    const respuesta = await fetch(
      "/api/instituciones/registro",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      }
    );

    const resultado = await respuesta.json()
      .catch(() => ({}));

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje ||
        `No se completó el registro (HTTP ${respuesta.status}).`
      );
    }

    registroCompletado = true;

    mostrarMensaje(
      "¡Institución registrada correctamente! " +
      "Tu identificador es " + resultado.idUsuario + ". " +
      "La cuenta se guardó en AccesIA. " +
      "El inicio de sesión institucional todavía " +
      "está pendiente de integración.",
      "success"
    );

    botonRegistrar.textContent = "Registro completado";
    botonRegistrar.disabled = true;

  } catch (error) {
    mostrarMensaje(
      "No se pudo completar el registro: " +
      error.message,
      "error"
    );

    botonRegistrar.disabled = false;
    botonRegistrar.textContent =
      "Registrar institución";
  }
});

/* ========================================
   MODO CLARO / OSCURO
======================================== */

const botonTema = obtener("tema");
const etiquetaTema = obtener("etiqueta-tema");

const temaGuardado = guardarPreferencia(() =>
  localStorage.getItem("accesia-theme")
);

raiz.dataset.theme =
  temaGuardado === "light" ? "light" : "dark";

function actualizarTema() {
  const esClaro = raiz.dataset.theme === "light";

  etiquetaTema.textContent =
    esClaro ? "Modo oscuro" : "Modo claro";

  botonTema.setAttribute(
    "aria-label",
    esClaro
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

  guardarPreferencia(() =>
    localStorage.setItem(
      "accesia-theme",
      raiz.dataset.theme
    )
  );

  actualizarTema();
});

/* ========================================
   ALTO CONTRASTE
======================================== */

const botonContraste = obtener("contraste");

botonContraste.addEventListener("click", () => {
  const activo = raiz.classList.toggle("high-contrast");

  botonContraste.setAttribute(
    "aria-pressed",
    String(activo)
  );
});

/* ========================================
   TAMAÑO DEL TEXTO
======================================== */

obtener("aumentar").addEventListener("click", () => {
  escalaTexto = Math.min(140, escalaTexto + 10);
  raiz.style.fontSize = escalaTexto + "%";
});

obtener("disminuir").addEventListener("click", () => {
  escalaTexto = Math.max(90, escalaTexto - 10);
  raiz.style.fontSize = escalaTexto + "%";
});

/* ========================================
   LECTURA ACCESIBLE
======================================== */

const botonEscuchar = obtener("escuchar");
const botonPausar = obtener("pausar");
const botonInstrucciones = obtener("instrucciones");

const puedeLeer = "speechSynthesis" in window;

let contenidoLectura = "";

function detenerLectura() {
  if (puedeLeer) {
    window.speechSynthesis.cancel();
  }

  obtener("etiqueta-pausar").textContent =
    "Pausar / Repetir";
}

function iniciarLectura(contenido) {
  if (!puedeLeer) return;

  detenerLectura();

  contenidoLectura = contenido;

  const voz = new SpeechSynthesisUtterance(contenido);

  voz.lang = "es-PE";
  voz.rate = 0.95;

  voz.onend = () => {
    obtener("etiqueta-pausar").textContent =
      "Pausar / Repetir";
  };

  window.speechSynthesis.speak(voz);
}

if (!puedeLeer) {
  botonEscuchar.disabled = true;
  botonPausar.disabled = true;
  botonInstrucciones.disabled = true;
} else {

  botonEscuchar.addEventListener("click", () => {
    iniciarLectura(
      "AccesIA. Registro de institución. " +
      "Completa los tres pasos para crear una " +
      "cuenta institucional. " +
      "Paso uno, datos de la institución. " +
      "Paso dos, datos del administrador. " +
      "Paso tres, seguridad y confirmación."
    );
  });

  botonInstrucciones.addEventListener("click", () => {
    const titulo = pasos[pasoActual]
      .querySelector("h2").textContent;

    const etiquetas = [
      ...pasos[pasoActual].querySelectorAll(
        ".reg-field label"
      )
    ].map((etiqueta) =>
      etiqueta.textContent.trim()
    );

    iniciarLectura(
      titulo + ". " +
      "Completa los siguientes campos. " +
      etiquetas.join(". ") + ". " +
      "Los campos con asterisco son obligatorios."
    );
  });

  botonPausar.addEventListener("click", () => {

    const motor = window.speechSynthesis;

    if (motor.paused) {
      motor.resume();

      obtener("etiqueta-pausar").textContent =
        "Pausar / Repetir";

    } else if (motor.speaking) {
      motor.pause();

      obtener("etiqueta-pausar").textContent =
        "Reanudar";

    } else if (contenidoLectura) {
      iniciarLectura(contenidoLectura);
    }
  });

  window.addEventListener("pagehide", detenerLectura);
}

/* ========================================
   INICIALIZACIÓN
======================================== */

mostrarPaso(0);
