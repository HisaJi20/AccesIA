
"use strict";

/* =========================================
   ACCESIA - GESTIÓN DE BENEFICIARIOS
   REGISTRAR + LISTAR + EDITAR
   SPRING BOOT / MYSQL / CSRF
========================================= */

/* =========================================
   1. ELEMENTOS DE LA INTERFAZ
========================================= */

const benefDialog = document.getElementById("benef-dialog");
const benefForm = document.getElementById("benef-form");
const benefMensaje = document.getElementById("benef-mensaje");

const benefBuscar = document.getElementById("benef-buscar");
const benefEstado = document.getElementById("benef-estado");
const benefCondicion = document.getElementById("benef-condicion");

const benefTabla = document.getElementById(
  "benef-tabla-cuerpo"
);

const benefResultado = document.getElementById(
  "benef-resultado-filtro"
);

const benefFiltrosActivos = document.getElementById(
  "benef-filtros-activos"
);

const benefTarjetas = document.querySelectorAll(
  "#vista-beneficiarios .benef-stat-card"
);

const benefEstadoTabla = document.querySelector(
  "#vista-beneficiarios .benef-table-state"
);

const benefPaginacion = document.querySelector(
  "#vista-beneficiarios .benef-pagination"
);

const benefAnterior = benefPaginacion.querySelector(
  "button:first-child"
);

const benefSiguiente = benefPaginacion.querySelector(
  "button:last-child"
);

const benefPaginaTexto = benefPaginacion.querySelector(
  "div span"
);

const benefCantidadTexto = benefPaginacion.querySelector(
  ":scope > span"
);

const benefTipoDocumento = document.getElementById(
  "benef-tipo-documento"
);

const benefDocumento = document.getElementById(
  "benef-documento"
);

const benefNacimiento = document.getElementById(
  "benef-nacimiento"
);

const benefBotonGuardar = benefForm.querySelector(
  'button[type="submit"]'
);

const benefTituloDialog = document.getElementById(
  "benef-dialog-titulo"
);

/* =========================================
   2. ESTADO DEL MÓDULO
========================================= */

let benefIdEdicion = null;

let beneficiariosPagina = [];
let paginaActual = 0;
let totalPaginas = 0;
let totalBeneficiarios = null;
let consultaRealizada = false;

/* =========================================
   3. UTILIDADES
========================================= */

function valorBenef(id) {
  return document.getElementById(id).value.trim();
}

function anunciarBenef(texto) {
  const estado = document.getElementById(
    "estado-accesible"
  );

  if (estado) {
    estado.textContent = texto;
  }
}

function nombreCondicion(valor) {
  const nombres = {
    CEGUERA_TOTAL: "Ceguera total",
    BAJA_VISION_SEVERA: "Baja visión severa",
    BAJA_VISION_MODERADA: "Baja visión moderada",
    VISION_TUBULAR: "Visión tubular",
    SORDOCEGUERA: "Sordoceguera",
    OTRA: "Otra"
  };

  return nombres[valor] || valor || "No especificado";
}

function nombreEstado(valor) {
  const nombres = {
    ACTIVO: "Activo",
    EN_EVALUACION: "En evaluación",
    INACTIVO: "Inactivo"
  };

  return nombres[valor] || valor || "Sin estado";
}

function fechaBeneficiario(fecha) {
  if (!fecha) {
    return "—";
  }

  const soloFecha = String(fecha).slice(0, 10);
  const partes = soloFecha.split("-");

  if (partes.length !== 3) {
    return soloFecha;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function mostrarMensajeTabla(mensaje) {
  const fila = document.createElement("tr");
  const celda = document.createElement("td");

  celda.colSpan = 7;
  celda.className = "benef-empty";
  celda.textContent = mensaje;

  fila.appendChild(celda);
  benefTabla.replaceChildren(fila);
}

/* =========================================
   4. INDICADORES
========================================= */

function actualizarIndicadores() {
  if (!consultaRealizada) {
    return;
  }

  const tarjetas = Array.from(benefTarjetas);

  if (tarjetas.length < 4) {
    return;
  }

  // El total sí corresponde a toda la institución.
  // Los otros indicadores corresponden a la página
  // consultada, hasta implementar estadísticas globales.
  const cantidades = [
    totalBeneficiarios,

    beneficiariosPagina.filter(
      b => b.estado === "ACTIVO"
    ).length,

    beneficiariosPagina.filter(
      b => b.estado === "EN_EVALUACION"
    ).length,

    beneficiariosPagina.filter(
      b => b.requiereLectorPantalla === true
    ).length
  ];

  const descripciones = [
    "Total de la institución",
    "En la página actual",
    "En la página actual",
    "En la página actual"
  ];

  tarjetas.forEach((tarjeta, indice) => {
    const numero = tarjeta.querySelector(
      ".benef-stat-value"
    );

    const descripcion = tarjeta.querySelector("p");

    if (numero) {
      numero.textContent = String(cantidades[indice]);
    }

    if (descripcion) {
      descripcion.textContent = descripciones[indice];
    }
  });
}

/* =========================================
   5. CONSTRUIR FILAS DE LA TABLA
========================================= */

function crearFilaBeneficiario(beneficiario) {
  const fila = document.createElement("tr");

  const documento = [
    beneficiario.tipoDocumento,
    beneficiario.numeroDocumento
  ]
    .filter(Boolean)
    .join(" ");

  const nombreCompleto = [
    beneficiario.nombres,
    beneficiario.apellidos
  ]
    .filter(Boolean)
    .join(" ");

  const valores = [
    documento,
    nombreCompleto,
    nombreCondicion(
      beneficiario.nivelDiscapacidadVisual
    ),
    beneficiario.telefono || "—",
    fechaBeneficiario(
      beneficiario.fechaRegistro
    ),
    nombreEstado(beneficiario.estado)
  ];

  // Columnas de información.
  valores.forEach(valor => {
    const celda = document.createElement("td");

    celda.textContent = valor || "—";

    fila.appendChild(celda);
  });

  // Columna de acciones.
  const celdaAcciones = document.createElement("td");
  celdaAcciones.className = "benef-acciones";

  /* BOTÓN VER FICHA */

  const botonVer = document.createElement("button");

  botonVer.type = "button";
  botonVer.className = "benef-ver-ficha";

  botonVer.dataset.fichaId = String(
    beneficiario.idFicha
  );

  botonVer.textContent = "Ver ficha";

  botonVer.setAttribute(
    "aria-label",
    "Ver ficha de " + nombreCompleto
  );

  celdaAcciones.appendChild(botonVer);

  /* BOTÓN EDITAR */

  const botonEditar = document.createElement("button");

  botonEditar.type = "button";
  botonEditar.className = "benef-editar-ficha";

  botonEditar.dataset.benefEditar = String(
    beneficiario.idFicha
  );

  botonEditar.textContent = "Editar";

  botonEditar.setAttribute(
    "aria-label",
    "Editar beneficiario " + nombreCompleto
  );

  celdaAcciones.appendChild(botonEditar);

  fila.appendChild(celdaAcciones);

  return fila;
}

/* =========================================
   6. FILTROS Y TABLA
========================================= */

function actualizarTablaBeneficiarios() {
  if (!consultaRealizada) {
    return;
  }

  const texto = benefBuscar.value
    .trim()
    .toLocaleLowerCase("es");

  const estado = benefEstado.value;
  const condicion = benefCondicion.value;

  // Filtros sobre los registros cargados en esta página.
  const filtrados = beneficiariosPagina.filter(
    beneficiario => {

      const buscable = [
        beneficiario.nombres,
        beneficiario.apellidos,
        beneficiario.numeroDocumento,
        beneficiario.tipoDocumento
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es");

      const coincideTexto =
        !texto || buscable.includes(texto);

      const coincideEstado =
        !estado || beneficiario.estado === estado;

      const coincideCondicion =
        !condicion ||
        beneficiario.nivelDiscapacidadVisual === condicion;

      return coincideTexto &&
             coincideEstado &&
             coincideCondicion;
    }
  );

  benefTabla.replaceChildren();

  if (filtrados.length === 0) {
    mostrarMensajeTabla(
      beneficiariosPagina.length === 0
        ? "Todavía no hay beneficiarios registrados."
        : "No hay coincidencias en esta página."
    );

  } else {
    filtrados.forEach(beneficiario => {
      benefTabla.appendChild(
        crearFilaBeneficiario(beneficiario)
      );
    });
  }

  const filtros = [];

  if (texto) {
    filtros.push("Búsqueda");
  }

  if (estado) {
    filtros.push("Estado");
  }

  if (condicion) {
    filtros.push("Condición visual");
  }

  benefFiltrosActivos.textContent =
    filtros.length > 0
      ? "Filtros activos: " + filtros.join(", ")
      : "Filtro activo: ninguno";

  benefResultado.textContent =
    `${filtrados.length} registros visibles ` +
    "en la página actual";

  benefEstadoTabla.textContent =
    `${totalBeneficiarios} registrados`;

  benefCantidadTexto.textContent =
    `Mostrando ${filtrados.length} de ` +
    `${beneficiariosPagina.length} registros ` +
    `de esta página. Total institucional: ` +
    `${totalBeneficiarios}.`;

  benefPaginaTexto.textContent =
    totalPaginas > 0
      ? `Página ${paginaActual + 1} de ${totalPaginas}`
      : "Página —";

  benefAnterior.disabled =
    paginaActual <= 0;

  benefSiguiente.disabled =
    paginaActual + 1 >= totalPaginas;
}

/* =========================================
   7. CONSULTAR BENEFICIARIOS EN MYSQL
========================================= */

async function cargarBeneficiarios(pagina = 0) {
  mostrarMensajeTabla(
    "Cargando beneficiarios..."
  );

  benefEstadoTabla.textContent =
    "Consultando...";

  benefAnterior.disabled = true;
  benefSiguiente.disabled = true;

  try {
    const url =
      "/api/instituciones/beneficiarios" +
      `?pagina=${pagina}&cantidad=10`;

    const respuesta = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Accept": "application/json"
      }
    });

    if (respuesta.redirected) {
      throw new Error(
        "La sesión ha expirado. Inicia sesión nuevamente."
      );
    }

    if (
      respuesta.status === 401 ||
      respuesta.status === 403
    ) {
      throw new Error(
        "No tienes permisos para consultar beneficiarios."
      );
    }

    if (respuesta.status === 404) {
      throw new Error(
        "La API de beneficiarios no está disponible."
      );
    }

    if (!respuesta.ok) {
      throw new Error(
        "Error del servidor: HTTP " + respuesta.status
      );
    }

    const resultado = await respuesta.json();

    if (!Array.isArray(resultado.content)) {
      throw new Error(
        "La API no devolvió un listado válido."
      );
    }

    beneficiariosPagina = resultado.content;
    paginaActual = Number(
      resultado.number ?? pagina
    );

    totalPaginas = Number(
      resultado.totalPages ?? 0
    );

    totalBeneficiarios = Number(
      resultado.totalElements ?? 0
    );

    consultaRealizada = true;

    actualizarIndicadores();
    actualizarTablaBeneficiarios();

    return true;

  } catch (error) {
    consultaRealizada = false;
    beneficiariosPagina = [];

    benefEstadoTabla.textContent =
      "Error de consulta";

    mostrarMensajeTabla(
      "No se pudieron cargar los beneficiarios: " +
      error.message
    );

    benefResultado.textContent =
      "No se pudo consultar el padrón.";

    benefCantidadTexto.textContent =
      "Consulta no disponible.";

    anunciarBenef(
      "Error al consultar beneficiarios: " +
      error.message
    );

    return false;
  }
}

/* =========================================
   8. VALIDACIÓN DE DOCUMENTO
========================================= */

function actualizarDocumento() {
  benefDocumento.setCustomValidity("");

  if (benefTipoDocumento.value === "DNI") {
    benefDocumento.pattern = "[0-9]{8}";
    benefDocumento.maxLength = 8;

    benefDocumento.title =
      "El DNI debe tener exactamente 8 dígitos.";

  } else {
    benefDocumento.removeAttribute("pattern");
    benefDocumento.maxLength = 20;

    benefDocumento.title =
      "Ingresa el número de documento.";
  }
}

benefTipoDocumento.addEventListener(
  "change",
  actualizarDocumento
);

benefDocumento.addEventListener(
  "input",
  () => benefDocumento.setCustomValidity("")
);

/* =========================================
   9. FECHA DE NACIMIENTO
========================================= */

const hoyBenef = new Date();

benefNacimiento.max = [
  hoyBenef.getFullYear(),
  String(hoyBenef.getMonth() + 1).padStart(2, "0"),
  String(hoyBenef.getDate()).padStart(2, "0")
].join("-");

/* =========================================
   10. ABRIR REGISTRO NUEVO
========================================= */

document.getElementById("benef-abrir-registro")
  .addEventListener("click", () => {

    benefIdEdicion = null;

    benefForm.reset();
    actualizarDocumento();

    benefMensaje.hidden = true;
    benefMensaje.textContent = "";

    benefTituloDialog.textContent =
      "Registrar beneficiario";

    benefBotonGuardar.textContent =
      "Registrar beneficiario";

    benefDialog.showModal();

    document.getElementById(
      "benef-tipo-documento"
    ).focus();
  });

/* =========================================
   11. CERRAR FORMULARIO
========================================= */

function cerrarFormularioBeneficiario() {
  benefDialog.close();
}

document.getElementById("benef-cerrar")
  .addEventListener(
    "click",
    cerrarFormularioBeneficiario
  );

document.getElementById("benef-cancelar")
  .addEventListener(
    "click",
    cerrarFormularioBeneficiario
  );

benefDialog.addEventListener("close", () => {
  benefIdEdicion = null;
});

/* =========================================
   12. ABRIR EDICIÓN DE BENEFICIARIO
========================================= */

benefTabla.addEventListener("click", async (evento) => {
  const boton = evento.target.closest(
    "[data-benef-editar]"
  );

  if (!boton) {
    return;
  }

  const idFicha = Number(
    boton.dataset.benefEditar
  );

  if (!Number.isInteger(idFicha) || idFicha <= 0) {
    return;
  }

  boton.disabled = true;

  const textoOriginal = boton.textContent;
  boton.textContent = "Cargando...";

  try {
    // Consultar la ficha real de MySQL.
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

    if (
      respuesta.redirected ||
      respuesta.status === 401 ||
      respuesta.status === 403
    ) {
      throw new Error(
        "La sesión institucional no es válida."
      );
    }

    if (respuesta.status === 404) {
      throw new Error(
        "La ficha no existe o no pertenece a tu institución."
      );
    }

    if (!respuesta.ok) {
      throw new Error(
        "Error HTTP " + respuesta.status
      );
    }

    const ficha = await respuesta.json();

    // Limpiar datos anteriores.
    benefForm.reset();
    benefMensaje.hidden = true;
    benefMensaje.textContent = "";

    // Completar formulario con datos existentes.
    const campos = {
      "benef-nombres": ficha.nombres,
      "benef-apellidos": ficha.apellidos,

      "benef-tipo-documento":
        ficha.tipoDocumento,

      "benef-documento":
        ficha.numeroDocumento,

      "benef-nacimiento":
        ficha.fechaNacimiento,

      "benef-sede":
        ficha.sede,

      "benef-visual":
        ficha.nivelDiscapacidadVisual,

      "benef-tecnologia":
        ficha.tecnologiaAsistencia,

      "benef-comunicacion":
        ficha.preferenciaComunicacion,

      "benef-observaciones":
        ficha.observaciones,

      "benef-telefono":
        ficha.telefono,

      "benef-correo":
        ficha.email,

      "benef-emergencia":
        ficha.contactoEmergencia,

      "benef-tel-emergencia":
        ficha.telefonoEmergencia
    };

    Object.entries(campos).forEach(([id, valor]) => {
      const control = document.getElementById(id);

      if (control) {
        control.value = valor ?? "";
      }
    });

    document.getElementById("benef-lector").checked =
      ficha.requiereLectorPantalla === true;

    actualizarDocumento();

    // Activar modo edición.
    benefIdEdicion = idFicha;

    benefTituloDialog.textContent =
      "Editar beneficiario";

    benefBotonGuardar.textContent =
      "Guardar cambios";

    benefDialog.showModal();

    document.getElementById(
      "benef-nombres"
    ).focus();

  } catch (error) {
    alert(
      "No se pudo abrir la edición: " +
      error.message
    );

  } finally {
    boton.disabled = false;
    boton.textContent = textoOriginal;
  }
});

/* =========================================
   13. DATOS DEL FORMULARIO
========================================= */

function obtenerDatosBeneficiario() {
  return {
    nombres:
      valorBenef("benef-nombres"),

    apellidos:
      valorBenef("benef-apellidos"),

    tipoDocumento:
      valorBenef("benef-tipo-documento"),

    numeroDocumento:
      valorBenef("benef-documento"),

    fechaNacimiento:
      valorBenef("benef-nacimiento") || null,

    sede:
      valorBenef("benef-sede") || null,

    nivelDiscapacidadVisual:
      valorBenef("benef-visual"),

    tecnologiaAsistencia:
      valorBenef("benef-tecnologia") || null,

    preferenciaComunicacion:
      valorBenef("benef-comunicacion") || null,

    requiereLectorPantalla:
      document.getElementById(
        "benef-lector"
      ).checked,

    observaciones:
      valorBenef("benef-observaciones") || null,

    telefono:
      valorBenef("benef-telefono") || null,

    email:
      valorBenef("benef-correo") || null,

    contactoEmergencia:
      valorBenef("benef-emergencia") || null,

    telefonoEmergencia:
      valorBenef("benef-tel-emergencia") || null
  };
}

/* =========================================
   14. REGISTRAR O EDITAR EN MYSQL
========================================= */

benefForm.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  actualizarDocumento();

  if (!benefForm.reportValidity()) {
    return;
  }

  const editando = benefIdEdicion !== null;
  const idActual = benefIdEdicion;

  benefBotonGuardar.disabled = true;

  benefBotonGuardar.textContent = editando
    ? "Guardando cambios..."
    : "Guardando beneficiario...";

  benefMensaje.hidden = false;

  benefMensaje.textContent = editando
    ? "Actualizando ficha en AccesIA..."
    : "Registrando beneficiario en AccesIA...";

  const datos = obtenerDatosBeneficiario();

  try {
    /* OBTENER TOKEN CSRF */

    const respuestaToken = await fetch(
      "/api/auth/csrf",
      {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "Accept": "application/json"
        }
      }
    );

    if (!respuestaToken.ok) {
      throw new Error(
        "No se pudo obtener el token de seguridad."
      );
    }

    const csrf = await respuestaToken.json();

    if (!csrf.headerName || !csrf.token) {
      throw new Error(
        "El token CSRF recibido no es válido."
      );
    }

    /* SELECCIONAR RUTA Y MÉTODO */

    const url = editando
      ? "/api/instituciones/beneficiarios/" + idActual
      : "/api/instituciones/beneficiarios";

    const metodo = editando ? "PUT" : "POST";

    /* GUARDAR EN MYSQL */

    const respuesta = await fetch(url, {
      method: metodo,
      credentials: "same-origin",

      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        [csrf.headerName]: csrf.token
      },

      body: JSON.stringify(datos)
    });

    if (respuesta.redirected) {
      throw new Error(
        "La sesión institucional ha expirado."
      );
    }

    const resultado = await respuesta.json()
      .catch(() => ({}));

    if (
      respuesta.status === 401 ||
      respuesta.status === 403
    ) {
      throw new Error(
        "No tienes una sesión institucional válida."
      );
    }

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje ||
        "No se pudo completar la operación. HTTP " +
        respuesta.status
      );
    }

    if (!Number.isInteger(resultado.idFicha)) {
      throw new Error(
        "El servidor no devolvió una ficha válida."
      );
    }

    /* OPERACIÓN REALIZADA */

    const mensajeExito = editando
      ? "¡Ficha actualizada correctamente! Código: " +
        resultado.idFicha
      : "¡Beneficiario registrado correctamente! Código: " +
        resultado.idFicha;

    benefMensaje.textContent = mensajeExito;

    // Limpiar los filtros y refrescar el padrón.
    benefBuscar.value = "";
    benefEstado.value = "";
    benefCondicion.value = "";

    benefForm.reset();
    benefDialog.close();
    benefIdEdicion = null;

    const listadoActualizado = await cargarBeneficiarios(0);

    if (listadoActualizado) {
      benefResultado.textContent = mensajeExito;
      anunciarBenef(mensajeExito);

    } else {
      anunciarBenef(
        mensajeExito +
        ". No se pudo actualizar la tabla automáticamente."
      );
    }

  } catch (error) {
    benefMensaje.textContent =
      "No se pudo guardar la ficha: " +
      error.message;

    benefMensaje.hidden = false;

    anunciarBenef(benefMensaje.textContent);

  } finally {
    benefBotonGuardar.disabled = false;

    benefBotonGuardar.textContent =
      benefIdEdicion === null
        ? "Registrar beneficiario"
        : "Guardar cambios";
  }
});

/* =========================================
   15. BÚSQUEDA Y FILTROS
========================================= */

[
  benefBuscar,
  benefEstado,
  benefCondicion
].forEach(control => {

  control.addEventListener(
    "input",
    actualizarTablaBeneficiarios
  );

  control.addEventListener(
    "change",
    actualizarTablaBeneficiarios
  );
});

document.getElementById("benef-limpiar")
  .addEventListener("click", () => {

    benefBuscar.value = "";
    benefEstado.value = "";
    benefCondicion.value = "";

    actualizarTablaBeneficiarios();

    benefBuscar.focus();
  });

/* =========================================
   16. PAGINACIÓN
========================================= */

benefAnterior.addEventListener("click", () => {
  if (paginaActual > 0) {
    cargarBeneficiarios(paginaActual - 1);
  }
});

benefSiguiente.addEventListener("click", () => {
  if (paginaActual + 1 < totalPaginas) {
    cargarBeneficiarios(paginaActual + 1);
  }
});

/* =========================================
   17. CARGAR LISTADO AL ABRIR MÓDULO
========================================= */

document.addEventListener("click", evento => {
  const boton = evento.target.closest(
    '[data-view="beneficiarios"]'
  );

  if (boton) {
    cargarBeneficiarios(0);
  }
});

/* =========================================
   18. INICIALIZACIÓN
========================================= */

actualizarDocumento();
