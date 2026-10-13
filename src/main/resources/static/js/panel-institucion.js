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

function mostrarDialogo(titulo, texto) {
  dialogoTitulo.textContent = titulo;
  dialogoTexto.textContent = texto;

  if (!dialogo.open) dialogo.showModal();
}

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

const modulos = {
  beneficiarios: {
    titulo: "Beneficiarios",
    texto: "Aquí podrás registrar, consultar y actualizar beneficiarios."
  },
  servicios: {
    titulo: "Servicios",
    texto: "Aquí podrás organizar los servicios de apoyo de tu institución."
  },
  personal: {
    titulo: "Personal",
    texto: "Aquí podrás registrar y consultar al personal de atención."
  },
  solicitudes: {
    titulo: "Solicitudes",
    texto: "Aquí podrás revisar las solicitudes recibidas y su estado."
  },
  asignaciones: {
    titulo: "Asignaciones",
    texto: "Aquí podrás asignar personal a las solicitudes de apoyo."
  },
  seguimiento: {
    titulo: "Seguimiento",
    texto: "Aquí podrás registrar avances y novedades de las atenciones."
  },
  reportes: {
    titulo: "Reportes",
    texto: "Aquí podrás consultar información sobre solicitudes y atenciones."
  },
  planes: {
    titulo: "Planes y suscripciones",
    texto: "Aquí podrás consultar los planes y la suscripción institucional."
  }
};

document.querySelectorAll("[data-modulo]").forEach((boton) => {
  boton.addEventListener("click", () => {
    const modulo = modulos[boton.dataset.modulo];

    if (modulo) {
      mostrarDialogo(
        modulo.titulo,
        modulo.texto + " Esta pantalla está pendiente de implementación."
      );
    }
  });
});

cerrarDialogoBtn.addEventListener("click", () => {
  dialogo.close();
});

ayudaBtn.addEventListener("click", () => {
  mostrarDialogo(
    "Cómo usar el panel institucional",
    "Selecciona un módulo para conocer su función. " +
    "Usa Tab para recorrer los controles, Enter para activarlos " +
    "y Escape para cerrar este mensaje. " +
    "Puedes regresar al inicio con Salir del modo demostración."
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
      "AccesIA. Panel institucional. " +
      "Gestiona tu institución y conecta con quienes necesitan apoyo. " +
      "Los módulos disponibles en esta demostración son: " +
      "Beneficiarios, Servicios, Personal, Solicitudes, Asignaciones, " +
      "Seguimiento, Reportes, y Planes y suscripciones. " +
      "Cada opción muestra una explicación. " +
      "Sus pantallas todavía están en construcción."
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