
"use strict";

/* =========================================
   ACCESIA - MODO CLARO Y OSCURO
   REGISTRO PERSONAL
========================================= */

const registroRaiz = document.documentElement;
const registroBotonTema = document.getElementById(
  "tema-btn"
);

function aplicarTemaRegistro(tema) {
  const claro = tema === "light";

  registroRaiz.dataset.theme =
    claro ? "light" : "dark";

  registroBotonTema.textContent =
    claro ? "Modo oscuro" : "Modo claro";

  registroBotonTema.setAttribute(
    "aria-pressed",
    String(claro)
  );
}

let temaInicial = "dark";

try {
  const guardado = localStorage.getItem("accesia-theme");

  if (guardado === "light") {
    temaInicial = "light";
  }
} catch (error) {
  // Utilizar el tema predeterminado.
}

aplicarTemaRegistro(temaInicial);

registroBotonTema.addEventListener("click", () => {
  const nuevoTema =
    registroRaiz.dataset.theme === "dark"
      ? "light"
      : "dark";

  aplicarTemaRegistro(nuevoTema);

  try {
    localStorage.setItem(
      "accesia-theme",
      nuevoTema
    );
  } catch (error) {
    // El tema seguirá funcionando en la página.
  }
});
