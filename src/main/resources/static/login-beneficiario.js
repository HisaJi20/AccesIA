"use strict";

const textoBtn = document.getElementById("texto-btn");
const contrasteBtn = document.getElementById("contraste-btn");
const leerBtn = document.getElementById("leer-btn");
const estado = document.getElementById("estado");
const mensaje = document.getElementById("mensaje-login");
const clave = document.getElementById("clave");
const mostrarClave = document.getElementById("mostrar-clave");

textoBtn.addEventListener("click", () => {
  const activo = document.documentElement.classList.toggle("texto-grande");
  textoBtn.setAttribute("aria-pressed", String(activo));

  estado.textContent = activo
    ? "Tamaño de texto aumentado."
    : "Tamaño de texto normal.";
});

contrasteBtn.addEventListener("click", () => {
  const activo = document.body.classList.toggle("alto-contraste");
  contrasteBtn.setAttribute("aria-pressed", String(activo));

  estado.textContent = activo
    ? "Alto contraste activado."
    : "Alto contraste desactivado.";
});

mostrarClave.addEventListener("click", () => {
  const mostrar = clave.type === "password";

  clave.type = mostrar ? "text" : "password";
  mostrarClave.textContent = mostrar ? "Ocultar" : "Mostrar";
  mostrarClave.setAttribute("aria-pressed", String(mostrar));
});

document.getElementById("login-form").addEventListener("submit", (evento) => {
  evento.preventDefault();

  mensaje.textContent =
    "Los campos están completos. Esta pantalla es una demostración: todavía no verifica cuentas ni inicia una sesión.";

  clave.value = "";
});

document.getElementById("recuperar-btn").addEventListener("click", () => {
  mensaje.textContent =
    "La recuperación de contraseña se conectará cuando implementemos las cuentas.";
});

document.getElementById("registro-btn").addEventListener("click", () => {
  mensaje.textContent =
    "Aquí conectaremos la pantalla de registro para beneficiarios.";
});

if (!("speechSynthesis" in window)) {
  leerBtn.disabled = true;
  leerBtn.textContent = "Lectura no disponible";
} else {
  let leyendo = false;

  function finalizarLectura() {
    leyendo = false;
    leerBtn.textContent = "▶ Leer página";
  }

  leerBtn.addEventListener("click", () => {
    if (leyendo) {
      window.speechSynthesis.cancel();
      finalizarLectura();
      return;
    }

    const lectura = new SpeechSynthesisUtterance(
      "AccesIA. Acceso para beneficiarios. " +
      "Tu apoyo comienza aquí. " +
      "Ingresa tu correo electrónico y tu contraseña. " +
      "Puedes mostrar u ocultar la contraseña, iniciar sesión, " +
      "recuperar tu acceso o registrarte como beneficiario. " +
      "Esta pantalla es un prototipo. " +
      "Usa Tab para navegar y Enter para activar los controles."
    );

    lectura.lang = "es-PE";
    lectura.rate = 0.95;
    lectura.onend = finalizarLectura;
    lectura.onerror = finalizarLectura;

    window.speechSynthesis.cancel();
    leyendo = true;
    leerBtn.textContent = "■ Detener lectura";
    window.speechSynthesis.speak(lectura);
  });

  window.addEventListener("pagehide", () => {
    window.speechSynthesis.cancel();
  });
}