
"use strict";

/* =========================================
   ACCESIA - INGRESO INSTITUCIONAL
========================================= */

// ELEMENTOS PRINCIPALES

const root = document.documentElement;

const form = document.getElementById("formulario");
const email = document.getElementById("correo");
const password = document.getElementById("clave");
const remember = document.getElementById("recordar");

const showPassword = document.getElementById("mostrar-clave");
const message = document.getElementById("mensaje-login");
const liveStatus = document.getElementById("estado-accesible");

const themeButton = document.getElementById("tema");
const themeLabel = document.getElementById("etiqueta-tema");

const contrastButton = document.getElementById("contraste");

const listenButton = document.getElementById("escuchar");
const pauseButton = document.getElementById("pausar");
const pauseLabel = document.getElementById("etiqueta-pausar");

const dialog = document.getElementById("dialogo");

let fontScale = 100;
let voiceContent = "";

/* =========================================
   MENSAJES ACCESIBLES
========================================= */

function notify(text) {
  liveStatus.textContent = text;
}

function showMessage(text) {
  message.textContent = text;
  message.hidden = !text;

  if (text) {
    notify(text);
  }
}

function safeStorage(action) {
  try {
    return action();
  } catch (error) {
    return null;
  }
}

/* =========================================
   MODO CLARO Y OSCURO
========================================= */

const storedTheme = safeStorage(() =>
  localStorage.getItem("accesia-theme")
);

root.dataset.theme =
  storedTheme === "light" ? "light" : "dark";

function updateTheme() {
  const light = root.dataset.theme === "light";

  themeLabel.textContent =
    light ? "Modo oscuro" : "Modo claro";

  themeButton.setAttribute(
    "aria-label",
    light ? "Activar modo oscuro" : "Activar modo claro"
  );

  themeButton.querySelector("use").setAttribute(
    "href",
    light ? "#i-moon" : "#i-sun"
  );
}

updateTheme();

themeButton.addEventListener("click", () => {
  root.dataset.theme =
    root.dataset.theme === "dark" ? "light" : "dark";

  safeStorage(() =>
    localStorage.setItem("accesia-theme", root.dataset.theme)
  );

  updateTheme();

  notify(
    `Modo ${root.dataset.theme === "light" ? "claro" : "oscuro"} activado.`
  );
});

/* =========================================
   ALTO CONTRASTE
========================================= */

contrastButton.addEventListener("click", () => {
  const active = root.classList.toggle("high-contrast");

  contrastButton.setAttribute(
    "aria-pressed",
    String(active)
  );

  notify(
    active
      ? "Alto contraste activado."
      : "Alto contraste desactivado."
  );
});

/* =========================================
   AJUSTAR TAMAÑO DEL TEXTO
========================================= */

document.getElementById("aumentar")
  .addEventListener("click", () => {

    fontScale = Math.min(140, fontScale + 10);
    root.style.fontSize = `${fontScale}%`;

    notify(`Texto al ${fontScale} por ciento.`);
  });

document.getElementById("disminuir")
  .addEventListener("click", () => {

    fontScale = Math.max(90, fontScale - 10);
    root.style.fontSize = `${fontScale}%`;

    notify(`Texto al ${fontScale} por ciento.`);
  });

/* =========================================
   MOSTRAR Y OCULTAR CONTRASEÑA
========================================= */

showPassword.addEventListener("click", () => {
  const visible = password.type === "password";

  password.type = visible ? "text" : "password";

  showPassword.setAttribute(
    "aria-pressed",
    String(visible)
  );

  showPassword.setAttribute(
    "aria-label",
    visible ? "Ocultar contraseña" : "Mostrar contraseña"
  );

  showPassword.querySelector("use").setAttribute(
    "href",
    visible ? "#i-eye-off" : "#i-eye"
  );
});

/* =========================================
   RECORDAR CORREO INSTITUCIONAL
========================================= */

const savedEmail = safeStorage(() =>
  localStorage.getItem("accesia-correo-institucion")
);

if (savedEmail) {
  email.value = savedEmail;
  remember.checked = true;
}

/* =========================================
   VALIDACIÓN DEL FORMULARIO
========================================= */

function clearErrors() {
  for (const field of [email, password]) {
    field.removeAttribute("aria-invalid");
  }

  document.getElementById("error-correo").textContent = "";
  document.getElementById("error-clave").textContent = "";

  showMessage("");
}

form.addEventListener("input", clearErrors);


form.addEventListener("submit", async (event) => {
  event.preventDefault();

  clearErrors();

  if (!email.checkValidity()) {
    email.setAttribute("aria-invalid", "true");

    document.getElementById("error-correo").textContent =
      "Ingresa un correo electrónico válido.";

    email.focus();
    return;
  }

  if (!password.value.trim()) {
    password.setAttribute("aria-invalid", "true");

    document.getElementById("error-clave").textContent =
      "Ingresa tu contraseña.";

    password.focus();
    return;
  }

  const botonEntrar = document.getElementById("entrar");
  const contenidoOriginal = botonEntrar.innerHTML;

  botonEntrar.disabled = true;
  botonEntrar.textContent = "Verificando credenciales...";

  showMessage("Comprobando tu cuenta institucional...");

  try {
    // Obtener token CSRF vinculado a la sesión.
    const respuestaToken = await fetch("/api/auth/csrf", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store"
    });

    if (!respuestaToken.ok) {
      throw new Error(
        "No se pudo obtener el token de seguridad."
      );
    }

    const token = await respuestaToken.json();

    // Spring Security recibe datos de formulario.
    const datos = new URLSearchParams();

    datos.set("correo", email.value.trim().toLowerCase());
    datos.set("clave", password.value);

    datos.set(token.parameterName, token.token);

    const respuesta = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: datos.toString()
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje ||
        "No se pudo iniciar sesión."
      );
    }

    // Recordar solo el correo, nunca la contraseña.
    if (remember.checked) {
      safeStorage(() =>
        localStorage.setItem(
          "accesia-correo-institucion",
          email.value.trim()
        )
      );
    } else {
      safeStorage(() =>
        localStorage.removeItem(
          "accesia-correo-institucion"
        )
      );
    }

    password.value = "";

    showMessage(
      "Inicio de sesión correcto. Abriendo el panel..."
    );

    window.location.assign("/panel-institucion.html");

  } catch (error) {
    showMessage(error.message);

    botonEntrar.disabled = false;
    botonEntrar.innerHTML = contenidoOriginal;
  }
});


/* =========================================
   RECUPERACIÓN DE CONTRASEÑA
========================================= */

function openRecovery() {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    showMessage(
      "La recuperación de contraseña aún no está habilitada."
    );
  }
}

document.getElementById("recuperar")
  .addEventListener("click", openRecovery);

document.getElementById("cerrar-dialogo")
  .addEventListener("click", () => {
    dialog.close();
  });

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

/* =========================================
   LECTURA DE PÁGINA
========================================= */

const speakingAvailable = "speechSynthesis" in window;

function resetVoice() {
  listenButton.setAttribute("aria-pressed", "false");

  pauseLabel.textContent = "Pausar / Repetir";
}

if (!speakingAvailable) {

  listenButton.disabled = true;
  pauseButton.disabled = true;

  listenButton.title =
    "Lectura de voz no disponible en este navegador";

} else {

  function speak(text) {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "es-PE";
    utterance.rate = 0.95;

    utterance.onend = resetVoice;
    utterance.onerror = resetVoice;

    window.speechSynthesis.speak(utterance);

    listenButton.setAttribute("aria-pressed", "true");
  }

  // INICIAR O DETENER LECTURA

  listenButton.addEventListener("click", () => {

    if (
      window.speechSynthesis.speaking ||
      window.speechSynthesis.paused
    ) {
      window.speechSynthesis.cancel();
      resetVoice();
      return;
    }

    voiceContent =
      "AccesIA. Ingreso institucional. " +
      "Accede al panel de administración de tu institución. " +
      "Ingresa tu correo institucional y tu contraseña. " +
      "Puedes mostrar u ocultar la contraseña. " +
      "También puedes registrar una institución " +
      "o volver al inicio.";

    speak(voiceContent);
  });

  // PAUSAR, REANUDAR O REPETIR

  pauseButton.addEventListener("click", () => {

    if (window.speechSynthesis.paused) {

      window.speechSynthesis.resume();

      pauseLabel.textContent = "Pausar / Repetir";

    } else if (window.speechSynthesis.speaking) {

      window.speechSynthesis.pause();

      pauseLabel.textContent = "Reanudar";

    } else if (voiceContent) {

      speak(voiceContent);

    } else {

      notify(
        "Primero selecciona Escuchar para iniciar la lectura."
      );
    }
  });

  window.addEventListener("pagehide", () => {
    window.speechSynthesis.cancel();
  });
}
