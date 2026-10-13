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
  estado.textContent = texto;
}

function mostrarDialogo(titulo, texto) {
  dialogoTitulo.textContent = titulo;
  dialogoTexto.textContent = texto;

  if (!dialogo.open) dialogo.showModal();
}

textoBtn.addEventListener("click", () => {
  const activo = document.documentElement.classList.toggle("texto-grande");

  textoBtn.setAttribute("aria-pressed", String(activo));

  anunciar(
    activo ? "Tamaño de texto aumentado." : "Tamaño de texto normal."
  );
});

contrasteBtn.addEventListener("click", () => {
  const activo = document.body.classList.toggle("alto-contraste");

  contrasteBtn.setAttribute("aria-pressed", String(activo));

  anunciar(
    activo ? "Alto contraste activado." : "Alto contraste desactivado."
  );
});

const opciones = {
  servicios: {
    titulo: "Servicios disponibles",
    texto:
      "Aquí podrás explorar los servicios de apoyo. " +
      "Esta será la siguiente pantalla que construiremos."
  },
  solicitar: {
    titulo: "Solicitar apoyo",
    texto:
      "Aquí podrás seleccionar un servicio y explicar qué asistencia necesitas. " +
      "El formulario se creará en un siguiente paso."
  },
  solicitudes: {
    titulo: "Mis solicitudes",
    texto:
      "Aquí podrás consultar el estado y seguimiento de tus solicitudes. " +
      "Esta pantalla está pendiente de implementación."
  },
  asistente: {
    titulo: "Asistente IA",
    texto:
      "Aquí podrás consultar orientación sobre la plataforma y sus servicios. " +
      "El asistente todavía no está conectado."
  }
};

document.querySelectorAll("[data-opcion]").forEach((boton) => {
  boton.addEventListener("click", () => {
    const opcion = opciones[boton.dataset.opcion];

    if (opcion) {
      mostrarDialogo(opcion.titulo, opcion.texto);
    }
  });
});

cerrarDialogoBtn.addEventListener("click", () => {
  dialogo.close();
});

ayudaBtn.addEventListener("click", () => {
  mostrarDialogo(
    "Cómo usar tu panel",
    "Selecciona una de las cuatro opciones. " +
    "Puedes aumentar el texto, activar el alto contraste o escuchar la página. " +
    "Usa Tab para recorrer los controles, Enter para activarlos " +
    "y Escape para cerrar este mensaje."
  );
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

    const lectura = new SpeechSynthesisUtterance(
      "AccesIA. Panel del beneficiario. " +
      "Bienvenido a tu espacio de apoyo. " +
      "Puedes explorar servicios disponibles, crear una solicitud de apoyo, " +
      "consultar tus solicitudes o acceder al asistente. " +
      "Las pantallas de estas opciones están en construcción. " +
      "Para regresar al inicio, selecciona Salir del modo demostración."
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