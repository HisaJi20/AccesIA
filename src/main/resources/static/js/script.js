"use strict";

const textoBtn = document.getElementById("texto-btn");
const contrasteBtn = document.getElementById("contraste-btn");
const leerBtn = document.getElementById("leer-btn");
const estado = document.getElementById("estado");

const dialogo = document.getElementById("dialogo");
const dialogoTitulo = document.getElementById("dialogo-titulo");
const dialogoTexto = document.getElementById("dialogo-texto");
const cerrarDialogoBtn = document.getElementById("cerrar-dialogo");
const ayudaBtn = document.getElementById("ayuda-btn");

function anunciar(texto) {
  if (estado) estado.textContent = texto;
}

function mostrarDialogo(titulo, texto) {
  if (!dialogo || !dialogoTitulo || !dialogoTexto) return;

  dialogoTitulo.textContent = titulo;
  dialogoTexto.textContent = texto;

  if (!dialogo.open) dialogo.showModal();
}

textoBtn?.addEventListener("click", () => {
  const activo = document.documentElement.classList.toggle("texto-grande");

  textoBtn.setAttribute("aria-pressed", String(activo));

  anunciar(
    activo ? "Tamaño de texto aumentado." : "Tamaño de texto normal."
  );
});

contrasteBtn?.addEventListener("click", () => {
  const activo = document.body.classList.toggle("alto-contraste");

  contrasteBtn.setAttribute("aria-pressed", String(activo));

  anunciar(
    activo ? "Alto contraste activado." : "Alto contraste desactivado."
  );
});

cerrarDialogoBtn?.addEventListener("click", () => {
  dialogo?.close();
});

const registros = {
  registro: {
    titulo: "Registro de institución",
    texto: "La pantalla de registro de instituciones será el siguiente paso de este prototipo."
  },
  "registro-beneficiario": {
    titulo: "Registro de beneficiario",
    texto: "La pantalla de registro de beneficiarios está pendiente de implementación."
  }
};

document.querySelectorAll("[data-perfil]").forEach((boton) => {
  boton.addEventListener("click", () => {
    const opcion = registros[boton.dataset.perfil];

    if (opcion) {
      mostrarDialogo(opcion.titulo, opcion.texto);
    }
  });
});

ayudaBtn?.addEventListener("click", () => {
  mostrarDialogo(
    "Cómo usar AccesIA",
    "Selecciona Acceso institucional o Acceso para beneficiarios para abrir el formulario correspondiente. Puedes aumentar el texto, activar el contraste y escuchar la página. Usa Tab para recorrer los controles y Enter para activar los enlaces."
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

      const lectura = new SpeechSynthesisUtterance(
        "AccesIA. Un mundo de apoyo, a tu alcance. " +
        "Conectamos instituciones y personas con discapacidad visual " +
        "para facilitar el acceso a servicios de apoyo. " +
        "¿Cómo deseas ingresar? " +
        "Si representas a una institución, selecciona Acceso institucional. " +
        "Si eres beneficiario, selecciona Acceso para beneficiarios. " +
        "También puedes consultar las opciones de registro y ayuda."
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