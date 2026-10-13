"use strict";

const formulario = document.getElementById("registro-form");
const clave = document.getElementById("clave");
const confirmarClave = document.getElementById("confirmar-clave");
const mensaje = document.getElementById("mensaje-registro");

const textoBtn = document.getElementById("texto-btn");
const contrasteBtn = document.getElementById("contraste-btn");
const leerBtn = document.getElementById("leer-btn");

textoBtn.addEventListener("click", () => {
  const activo = document.documentElement.classList.toggle("texto-grande");
  textoBtn.setAttribute("aria-pressed", String(activo));
});

contrasteBtn.addEventListener("click", () => {
  const activo = document.body.classList.toggle("alto-contraste");
  contrasteBtn.setAttribute("aria-pressed", String(activo));
});

document.querySelectorAll("[data-mostrar]").forEach((boton) => {
  boton.addEventListener("click", () => {
    const entrada = document.getElementById(boton.dataset.mostrar);
    const mostrar = entrada.type === "password";

    entrada.type = mostrar ? "text" : "password";
    boton.textContent = mostrar ? "Ocultar" : "Mostrar";
    boton.setAttribute("aria-pressed", String(mostrar));
  });
});

function validarCoincidencia() {
  confirmarClave.setCustomValidity(
    confirmarClave.value !== clave.value
      ? "Las contraseñas deben coincidir."
      : ""
  );
}

clave.addEventListener("input", validarCoincidencia);
confirmarClave.addEventListener("input", validarCoincidencia);

formulario.addEventListener("input", () => {
  mensaje.textContent = "";
});

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  validarCoincidencia();

  // Evita nombres compuestos únicamente por espacios.
  formulario.querySelectorAll('input[type="text"]').forEach((entrada) => {
    entrada.value = entrada.value.trim();
  });

  if (!formulario.reportValidity()) return;

  mensaje.textContent =
    "Los campos son válidos. Esta es una demostración: " +
    "todavía no se ha creado ni guardado una cuenta.";
});

if ("speechSynthesis" in window) {
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

    const titulo = document.getElementById("titulo-registro").textContent;
    const etiquetas = Array.from(
      formulario.querySelectorAll("label")
    ).map((etiqueta) => etiqueta.textContent).join(". ");

    // Lee instrucciones y etiquetas, sin leer los datos ingresados.
    const lectura = new SpeechSynthesisUtterance(
      "AccesIA. " + titulo + ". " +
      "Completa los siguientes campos: " + etiquetas + ". " +
      "La contraseña debe tener al menos ocho caracteres. " +
      "Ambas contraseñas deben coincidir. " +
      "Usa Tab para recorrer los campos. " +
      "Este formulario es un prototipo y todavía no crea cuentas."
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
} else {
  leerBtn.disabled = true;
  leerBtn.textContent = "Lectura no disponible";
}