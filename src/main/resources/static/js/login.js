"use strict";

const textoBtn = document.getElementById("texto-btn");
const contrasteBtn = document.getElementById("contraste-btn");
const leerBtn = document.getElementById("leer-btn");
const estado = document.getElementById("estado");

const formulario = document.getElementById("login-form");
const clave = document.getElementById("clave");
const mostrarClaveBtn = document.getElementById("mostrar-clave");
const recuperarBtn = document.getElementById("recuperar-btn");
const mensaje = document.getElementById("mensaje-login");

const destinosPermitidos = [
  "panel-beneficiario.html",
  "panel-institucion.html"
];

function anunciar(texto) {
  if (estado) {
    estado.textContent = texto;
  }
}

function mostrarMensaje(texto) {
  if (mensaje) {
    mensaje.textContent = texto;
  }
}

textoBtn?.addEventListener("click", () => {
  const activo = document.documentElement.classList.toggle("texto-grande");

  textoBtn.setAttribute("aria-pressed", String(activo));

  anunciar(
    activo
      ? "Tamaño de texto aumentado."
      : "Tamaño de texto normal."
  );
});

contrasteBtn?.addEventListener("click", () => {
  const activo = document.body.classList.toggle("alto-contraste");

  contrasteBtn.setAttribute("aria-pressed", String(activo));

  anunciar(
    activo
      ? "Alto contraste activado."
      : "Alto contraste desactivado."
  );
});

mostrarClaveBtn?.addEventListener("click", () => {
  if (!clave) return;

  const mostrar = clave.type === "password";

  clave.type = mostrar ? "text" : "password";
  mostrarClaveBtn.textContent = mostrar ? "Ocultar" : "Mostrar";
  mostrarClaveBtn.setAttribute("aria-pressed", String(mostrar));
});

formulario?.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!formulario.reportValidity()) return;

  const destino = formulario.dataset.destinoDemo;

  if (!destinosPermitidos.includes(destino)) {
    mostrarMensaje(
      "Esta pantalla todavía no tiene un panel de demostración conectado."
    );
    return;
  }

  // Navegación de demostración: no verifica cuentas ni guarda datos.
  formulario.reset();

  if (clave) {
    clave.type = "password";
  }

  if (mostrarClaveBtn) {
    mostrarClaveBtn.textContent = "Mostrar";
    mostrarClaveBtn.setAttribute("aria-pressed", "false");
  }

  window.location.href = destino;
});

formulario?.addEventListener("input", () => {
  mostrarMensaje("");
});

recuperarBtn?.addEventListener("click", () => {
  mostrarMensaje(
    "La recuperación de contraseña se conectará cuando implementemos las cuentas."
  );
});

if (leerBtn) {
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

      const tipo = document.getElementById("tipo-acceso")
        ?.textContent.trim() || "Inicio de sesión";

      const titulo = document.getElementById("titulo-login")
        ?.textContent.trim() || "";

      const descripcion = document.getElementById("descripcion-login")
        ?.textContent.trim() || "";

      const tienePanel = destinosPermitidos.includes(
        formulario?.dataset.destinoDemo
      );

      const instrucciones = tienePanel
        ? "Escribe un correo con formato válido y una contraseña de prueba. " +
          "Selecciona Entrar al panel de demostración. " +
          "No se verifican cuentas ni se guardan los datos ingresados. "
        : "Esta pantalla todavía no tiene un panel conectado. ";

      // Lee instrucciones sin leer los datos ingresados.
      const lectura = new SpeechSynthesisUtterance(
        "AccesIA. " + tipo + ". " + titulo + ". " + descripcion + " " +
        instrucciones +
        "Puedes mostrar u ocultar la contraseña. " +
        "Para registrarte, selecciona el enlace de registro. " +
        "Para regresar al inicio, selecciona Cambiar tipo de acceso."
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
}