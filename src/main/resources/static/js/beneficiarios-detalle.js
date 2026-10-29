
"use strict";

/* =========================================
   ACCESIA - CONSULTAR FICHA BENEFICIARIO
========================================= */

const dialogoFicha = document.getElementById(
  "benef-detalle-dialog"
);

const contenidoFicha = document.getElementById(
  "benef-detalle-contenido"
);

const tablaFichas = document.getElementById(
  "benef-tabla-cuerpo"
);

/* =========================================
   CERRAR VENTANA
========================================= */

function cerrarFicha() {
  dialogoFicha.close();
}

document.getElementById("benef-detalle-cerrar")
  .addEventListener("click", cerrarFicha);

document.getElementById("benef-detalle-cerrar-x")
  .addEventListener("click", cerrarFicha);

/* =========================================
   FORMATO DE LOS DATOS
========================================= */

function textoFicha(valor) {

  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ""
  ) {
    return "No registrado";
  }

  return String(valor);
}

function fechaFicha(valor) {

  if (!valor) {
    return "No registrada";
  }

  const fecha = String(valor).slice(0, 10);
  const partes = fecha.split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function condicionFicha(valor) {

  const nombres = {
    CEGUERA_TOTAL: "Ceguera total",
    BAJA_VISION_SEVERA: "Baja visión severa",
    BAJA_VISION_MODERADA: "Baja visión moderada",
    VISION_TUBULAR: "Visión tubular",
    SORDOCEGUERA: "Sordoceguera",
    OTRA: "Otra"
  };

  return nombres[valor] || textoFicha(valor);
}

function estadoFicha(valor) {

  const estados = {
    ACTIVO: "Activo",
    EN_EVALUACION: "En evaluación",
    INACTIVO: "Inactivo"
  };

  return estados[valor] || textoFicha(valor);
}

/* =========================================
   MOSTRAR DATOS DE LA FICHA
========================================= */

function mostrarDetalleFicha(ficha) {

  const campos = [

    ["Código de ficha", ficha.idFicha],

    [
      "Nombre completo",
      [ficha.nombres, ficha.apellidos]
        .filter(Boolean)
        .join(" ")
    ],

    ["Tipo de documento", ficha.tipoDocumento],

    ["Número de documento", ficha.numeroDocumento],

    [
      "Fecha de nacimiento",
      fechaFicha(ficha.fechaNacimiento)
    ],

    ["Sede institucional", ficha.sede],

    [
      "Condición visual",
      condicionFicha(
        ficha.nivelDiscapacidadVisual
      )
    ],

    [
      "Tecnología de asistencia",
      ficha.tecnologiaAsistencia
    ],

    [
      "Preferencia de comunicación",
      ficha.preferenciaComunicacion
    ],

    [
      "Requiere lector de pantalla",
      ficha.requiereLectorPantalla === true
        ? "Sí"
        : "No"
    ],

    ["Observaciones", ficha.observaciones],

    ["Teléfono", ficha.telefono],

    ["Correo electrónico", ficha.email],

    [
      "Contacto de emergencia",
      ficha.contactoEmergencia
    ],

    [
      "Teléfono de emergencia",
      ficha.telefonoEmergencia
    ],

    [
      "Estado institucional",
      estadoFicha(ficha.estado)
    ],

    [
      "Fecha de registro",
      fechaFicha(ficha.fechaRegistro)
    ]
  ];

  const lista = document.createElement("dl");

  lista.className = "benef-detalle-grid";

  campos.forEach(([etiqueta, valor]) => {

    const campo = document.createElement("div");
    campo.className = "benef-detalle-campo";

    const titulo = document.createElement("dt");
    titulo.textContent = etiqueta;

    const contenido = document.createElement("dd");
    contenido.textContent = textoFicha(valor);

    campo.appendChild(titulo);
    campo.appendChild(contenido);

    lista.appendChild(campo);
  });

  contenidoFicha.replaceChildren(lista);
}

/* =========================================
   CONSULTAR FICHA DESDE MYSQL
========================================= */

tablaFichas.addEventListener(
  "click",
  async (evento) => {

    const boton = evento.target.closest(
      "[data-ficha-id]"
    );

    if (!boton) {
      return;
    }

    const idFicha = Number(
      boton.dataset.fichaId
    );

    if (
      !Number.isInteger(idFicha) ||
      idFicha <= 0
    ) {
      return;
    }

    // Abrir ventana.
    contenidoFicha.textContent =
      "Consultando ficha del beneficiario...";

    dialogoFicha.showModal();

    try {

      const respuesta = await fetch(
        "/api/instituciones/beneficiarios/" + idFicha,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Accept": "application/json"
          }
        }
      );

      // Validar sesión.
      if (
        respuesta.redirected ||
        respuesta.status === 401 ||
        respuesta.status === 403
      ) {
        throw new Error(
          "No tienes una sesión institucional válida."
        );
      }

      // Validar existencia de ficha.
      if (respuesta.status === 404) {
        throw new Error(
          "La ficha no existe o no pertenece a tu institución."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          "Error al consultar la ficha. HTTP " +
          respuesta.status
        );
      }

      // Obtener datos reales.
      const ficha = await respuesta.json();

      // Mostrar información.
      mostrarDetalleFicha(ficha);

    } catch (error) {

      contenidoFicha.textContent =
        "No se pudo cargar la ficha: " +
        error.message;
    }
  }
);
