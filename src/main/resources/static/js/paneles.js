"use strict";

(() => {
  const institucional =
    document.body.dataset.perfil === "institucion";

  const menu = document.getElementById("menu-modulos");
  const vista = document.getElementById("vista-modulo");
  const titulo = document.getElementById("titulo-panel");
  const descripcion = document.getElementById("descripcion-panel");
  const etiqueta = document.getElementById("etiqueta-panel");
  const contenido = document.getElementById("contenido");
  const estado = document.getElementById("estado");

  if (!menu || !vista || !titulo) return;

  /* ======================================
     DATOS DE DEMOSTRACIÓN
     ====================================== */

  const CLAVE = "accesia-datos-demo-v1";

  let datos = {
    beneficiarios: [],
    servicios: [],
    personal: [],
    solicitudes: [],
    asignaciones: [],
    seguimiento: [],
    plan: ""
  };

  try {
    const almacenados = JSON.parse(
      localStorage.getItem(CLAVE) || "null"
    );

    if (almacenados && typeof almacenados === "object") {
      for (const nombre of Object.keys(datos)) {
        if (nombre === "plan") {
          datos.plan =
            typeof almacenados.plan === "string"
              ? almacenados.plan
              : "";
        } else if (Array.isArray(almacenados[nombre])) {
          datos[nombre] = almacenados[nombre];
        }
      }
    }
  } catch {
    console.warn(
      "No se pudieron recuperar los datos de demostración."
    );
  }

  function guardar() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos));
      return true;
    } catch {
      return false;
    }
  }

  /* ======================================
     UTILIDADES
     ====================================== */

  function elemento(tipo, texto = "", clase = "") {
    const nodo = document.createElement(tipo);

    if (texto !== "") nodo.textContent = texto;
    if (clase) nodo.className = clase;

    return nodo;
  }

  function avisar(texto) {
    if (estado) estado.textContent = texto;
  }

  function boton(
    texto,
    accion,
    clase = "boton-secundario"
  ) {
    const control = elemento("button", texto, clase);
    control.type = "button";
    control.addEventListener("click", accion);
    return control;
  }

  function identificar() {
    return window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function fechaActual() {
    const fecha = new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }

  function buscar(lista, id) {
    return datos[lista].find((registro) => registro.id === id);
  }

  function nombreSolicitud(id) {
    const solicitud = buscar("solicitudes", id);

    if (!solicitud) return "Solicitud no disponible";

    const beneficiario = buscar(
      "beneficiarios",
      solicitud.beneficiario
    );

    const servicio = buscar(
      "servicios",
      solicitud.servicio
    );

    return `${beneficiario?.nombre || "Beneficiario"} · ${
      servicio?.nombre || "Servicio"
    }`;
  }

  function nombreRelacionado(lista, id) {
    if (lista === "solicitudes") {
      return nombreSolicitud(id);
    }

    return buscar(lista, id)?.nombre || "Registro no disponible";
  }

  /* ======================================
     CONFIGURACIÓN DE MÓDULOS
     ====================================== */

  const modulos = {
    beneficiarios: {
      nombre: "Beneficiarios",
      icono: "♙",
      descripcion:
        "Registra y consulta beneficiarios ficticios de tu institución.",
      campos: [
        {
          clave: "nombre",
          etiqueta: "Nombre completo"
        },
        {
          clave: "correo",
          etiqueta: "Correo electrónico",
          tipo: "email",
          opcional: true
        },
        {
          clave: "necesidad",
          etiqueta: "Apoyo solicitado",
          tipo: "textarea"
        }
      ]
    },

    servicios: {
      nombre: "Servicios",
      icono: "▦",
      descripcion:
        "Organiza los servicios de apoyo que ofrece tu institución.",
      campos: [
        {
          clave: "nombre",
          etiqueta: "Nombre del servicio"
        },
        {
          clave: "descripcion",
          etiqueta: "Descripción",
          tipo: "textarea"
        },
        {
          clave: "horario",
          etiqueta: "Horario de atención"
        },
        {
          clave: "estado",
          etiqueta: "Disponibilidad",
          opciones: ["Disponible", "No disponible"]
        }
      ]
    },

    personal: {
      nombre: "Personal",
      icono: "♙",
      descripcion:
        "Registra al equipo ficticio responsable de brindar apoyo.",
      campos: [
        {
          clave: "nombre",
          etiqueta: "Nombre completo"
        },
        {
          clave: "cargo",
          etiqueta: "Cargo o especialidad"
        },
        {
          clave: "correo",
          etiqueta: "Correo electrónico",
          tipo: "email",
          opcional: true
        }
      ]
    },

    solicitudes: {
      nombre: "Solicitudes",
      icono: "✉",
      descripcion:
        "Crea solicitudes de demostración y actualiza su estado.",
      campos: [
        {
          clave: "beneficiario",
          etiqueta: "Beneficiario",
          lista: "beneficiarios"
        },
        {
          clave: "servicio",
          etiqueta: "Servicio solicitado",
          lista: "servicios"
        },
        {
          clave: "detalle",
          etiqueta: "Detalle de la solicitud",
          tipo: "textarea"
        },
        {
          clave: "estado",
          etiqueta: "Estado",
          opciones: [
            "Pendiente",
            "En atención",
            "Finalizada",
            "Cancelada"
          ]
        }
      ]
    },

    asignaciones: {
      nombre: "Asignaciones",
      icono: "↔",
      descripcion:
        "Relaciona una solicitud con su responsable de atención.",
      campos: [
        {
          clave: "solicitud",
          etiqueta: "Solicitud",
          lista: "solicitudes"
        },
        {
          clave: "personal",
          etiqueta: "Responsable",
          lista: "personal"
        },
        {
          clave: "fecha",
          etiqueta: "Fecha de atención",
          tipo: "date"
        }
      ]
    },

    seguimiento: {
      nombre: "Seguimiento",
      icono: "✓",
      descripcion:
        "Registra novedades y avances de las solicitudes.",
      campos: [
        {
          clave: "solicitud",
          etiqueta: "Solicitud",
          lista: "solicitudes"
        },
        {
          clave: "fecha",
          etiqueta: "Fecha del seguimiento",
          tipo: "date"
        },
        {
          clave: "nota",
          etiqueta: "Novedad o avance",
          tipo: "textarea"
        }
      ]
    }
  };

  /* ======================================
     ESTILOS DE FORMULARIOS Y PLANES
     ====================================== */

  if (!document.getElementById("estilos-modulos-accesia")) {
    const estilos = elemento("style");
    estilos.id = "estilos-modulos-accesia";

    estilos.textContent = `
      .demo-acciones {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        margin-top: 18px;
      }

      .demo-acciones button {
        width: auto;
        margin: 0;
      }

      .demo-lista {
        display: grid;
        gap: 16px;
        margin-top: 24px;
      }

      .demo-registro {
        min-width: 0;
        padding: 20px;
        border: 1px solid var(--borde);
        border-radius: 16px;
        background: rgba(21, 16, 28, 0.55);
        overflow-wrap: anywhere;
      }

      .demo-registro h3 {
        margin-top: 0;
      }

      .demo-registro p {
        line-height: 1.6;
        white-space: pre-wrap;
      }

      .demo-formulario textarea,
      .demo-formulario select,
      .demo-busqueda input {
        width: 100%;
        min-width: 0;
        min-height: 54px;
        padding: 14px 16px;
        border: 1px solid var(--borde);
        border-radius: 12px;
        font: inherit;
        color: var(--texto);
        background: #211729;
      }

      .demo-formulario textarea {
        min-height: 110px;
        resize: vertical;
      }

      .demo-busqueda {
        margin-top: 24px;
      }

      .demo-formulario textarea:focus-visible,
      .demo-formulario select:focus-visible,
      .demo-busqueda input:focus-visible {
        outline: 3px solid #fde68a;
        outline-offset: 3px;
      }

      .demo-resumen {
        display: grid;
        grid-template-columns: repeat(
          auto-fit,
          minmax(min(170px, 100%), 1fr)
        );
        gap: 16px;
        margin-top: 24px;
      }

      .demo-resumen .demo-registro {
        margin: 0;
      }

      /* Planes */

      .planes-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        align-items: stretch;
        gap: 22px;
        margin-top: 28px;
      }

      .plan-tarjeta {
        min-width: 0;
        display: flex;
        flex-direction: column;
        padding: clamp(22px, 2vw, 30px);
        border: 1px solid rgba(196, 181, 253, 0.35);
        border-radius: 22px;
        background: rgba(27, 19, 39, 0.82);
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      .plan-tarjeta:hover {
        border-color: #c4b5fd;
      }

      .plan-recomendado {
        border: 2px solid #c4b5fd;
        box-shadow:
          0 0 0 3px rgba(196, 181, 253, 0.08),
          0 18px 40px rgba(0, 0, 0, 0.22);
      }

      .plan-seleccionado {
        border-color: #fde68a;
      }

      .plan-cabecera {
        padding-bottom: 24px;
        border-bottom: 1px solid var(--borde);
      }

      .plan-distintivos {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 8px;
        min-height: 40px;
        margin-bottom: 12px;
      }

      .plan-insignia {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 999px;
        background: #c4b5fd;
        color: #211729;
        font-size: 0.85rem;
        font-weight: 700;
        line-height: 1.4;
      }

      .plan-insignia-activa {
        background: #fde68a;
        color: #211729;
      }

      .plan-cabecera h2 {
        margin: 0;
        color: var(--texto);
        font-size: clamp(1.3rem, 1.8vw, 1.7rem);
        line-height: 1.3;
        overflow-wrap: anywhere;
      }

      .plan-precio {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 8px;
        margin: 22px 0 12px;
      }

      .plan-precio strong {
        color: var(--texto);
        font-size: clamp(2rem, 3vw, 3rem);
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.04em;
      }

      .plan-precio span {
        color: var(--secundario);
        font-size: 1rem;
      }

      .plan-descripcion {
        min-height: 3.2em;
        margin: 0;
        color: var(--secundario);
        font-size: 1rem;
        line-height: 1.6;
      }

      .plan-beneficios {
        display: grid;
        align-content: start;
        gap: 18px;
        flex: 1;
        margin: 26px 0 30px;
        padding: 0;
        list-style: none;
      }

      .plan-beneficios li {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        color: var(--texto);
        font-size: 1rem;
        line-height: 1.6;
      }

      .plan-check {
        display: grid;
        place-items: center;
        flex: 0 0 28px;
        width: 28px;
        height: 28px;
        margin-top: 2px;
        border-radius: 50%;
        background: #c4b5fd;
        color: #211729;
        font-size: 0.95rem;
        font-weight: 700;
      }

      .plan-boton {
        min-height: 54px;
        margin-top: auto;
        font-size: 1rem;
        text-align: center;
      }

      .plan-boton:disabled {
        cursor: default;
        background: #3b2a52;
        color: #f8f5fc;
        border-color: #c4b5fd;
        opacity: 1;
      }

      .plan-confirmacion {
        margin: 24px 0 0;
        padding: 16px;
        border: 1px solid var(--borde);
        border-radius: 12px;
        background: rgba(21, 16, 28, 0.65);
        color: var(--texto);
        text-align: center;
        line-height: 1.6;
      }

      .plan-confirmacion:focus {
        outline: 3px solid #fde68a;
        outline-offset: 4px;
      }

      .planes-nota {
        margin: 20px 0 0;
        color: var(--secundario);
        text-align: center;
        font-size: 1rem;
        line-height: 1.6;
      }

      /* Alto contraste */

      .alto-contraste .demo-registro,
      .alto-contraste .demo-formulario textarea,
      .alto-contraste .demo-formulario select,
      .alto-contraste .demo-busqueda input,
      .alto-contraste .plan-tarjeta,
      .alto-contraste .plan-confirmacion {
        background: #000;
        border-color: #fff;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
      }

      .alto-contraste .plan-recomendado,
      .alto-contraste .plan-seleccionado {
        border-color: #fde047;
        box-shadow: none;
      }

      .alto-contraste .plan-insignia,
      .alto-contraste .plan-check {
        background: #fde047;
        color: #000;
      }

      .alto-contraste .plan-boton:disabled {
        background: #000;
        color: #fff;
        border-color: #fff;
      }

      /* Adaptación a pantallas pequeñas */

      @media (max-width: 1200px) {
        .planes-grid {
          grid-template-columns: 1fr;
        }

        .plan-distintivos {
          min-height: 0;
        }

        .plan-descripcion {
          min-height: 0;
        }
      }

      html.texto-grande .planes-grid {
        grid-template-columns: 1fr;
      }
    `;

    document.head.append(estilos);
  }

  /* ======================================
     NAVEGACIÓN
     ====================================== */

  const inicio = {
    titulo: titulo.innerHTML,
    descripcion: descripcion?.textContent || "",
    etiqueta: etiqueta?.textContent || ""
  };

  function seleccionar(id) {
    menu.querySelectorAll("[data-modulo]").forEach((opcion) => {
      if (opcion.dataset.modulo === id) {
        opcion.setAttribute("aria-current", "page");
      } else {
        opcion.removeAttribute("aria-current");
      }
    });
  }

  function preparar(id, nombre, texto) {
    detenerLectura();
    seleccionar(id);
    titulo.textContent = nombre;

    if (descripcion) descripcion.textContent = texto;

    if (etiqueta) {
      etiqueta.textContent = institucional
        ? "Espacio institucional"
        : "Espacio del beneficiario";
    }

    vista.replaceChildren();

    vista.append(
      elemento(
        "p",
        "Demostración: utiliza datos ficticios. Los cambios se guardan solo en este navegador.",
        "aviso-modulo"
      )
    );
  }

  function resumen() {
    const contenedor = elemento("div", "", "demo-resumen");

    for (const [id, configuracion] of Object.entries(modulos)) {
      const tarjeta = elemento("article", "", "demo-registro");

      tarjeta.append(
        elemento("h3", configuracion.nombre),
        elemento("p", `${datos[id].length} registros`)
      );

      contenedor.append(tarjeta);
    }

    return contenedor;
  }

  function mostrarInicio() {
    preparar("inicio", "Inicio", "");

    titulo.innerHTML = inicio.titulo;

    if (descripcion) {
      descripcion.textContent = inicio.descripcion;
    }

    if (etiqueta) {
      etiqueta.textContent = inicio.etiqueta;
    }

    vista.append(
      elemento("h2", "Bienvenido a AccesIA"),
      elemento(
        "p",
        institucional
          ? "Comienza registrando beneficiarios, servicios y personal. Después crea solicitudes, asignaciones y seguimientos."
          : "Consulta los servicios disponibles en esta demostración.",
        "texto-panel"
      )
    );

    if (institucional) vista.append(resumen());
  }

  /* ======================================
     REGISTRO, EDICIÓN Y ELIMINACIÓN
     ====================================== */

  function textoCampo(campo, valor) {
    if (campo.lista) {
      return nombreRelacionado(campo.lista, valor);
    }

    return String(valor || "Sin especificar");
  }

  function tieneDependencias(lista, id) {
    const relaciones = {
      beneficiarios: [["solicitudes", "beneficiario"]],
      servicios: [["solicitudes", "servicio"]],
      personal: [["asignaciones", "personal"]],
      solicitudes: [
        ["asignaciones", "solicitud"],
        ["seguimiento", "solicitud"]
      ]
    };

    return (relaciones[lista] || []).some(
      ([origen, campo]) =>
        datos[origen].some((registro) => registro[campo] === id)
    );
  }

  function formularioRegistro(id, registro = null) {
    const configuracion = modulos[id];

    preparar(
      id,
      configuracion.nombre,
      configuracion.descripcion
    );

    vista.append(
      elemento(
        "h2",
        registro ? "Editar registro" : "Nuevo registro"
      )
    );

    const formulario = elemento(
      "form",
      "",
      "formulario-login demo-formulario"
    );

    for (const campo of configuracion.campos) {
      const grupo = elemento("div", "", "campo");

      const label = elemento(
        "label",
        campo.etiqueta + (campo.opcional ? " (opcional)" : "")
      );

      const idCampo = `demo-${id}-${campo.clave}`;
      label.htmlFor = idCampo;

      let entrada;

      if (campo.lista || campo.opciones) {
        entrada = elemento("select");

        const inicial = elemento(
          "option",
          "Selecciona una opción"
        );

        inicial.value = "";
        entrada.append(inicial);

        if (campo.lista) {
          for (const item of datos[campo.lista]) {
            const opcion = elemento(
              "option",
              campo.lista === "solicitudes"
                ? nombreSolicitud(item.id)
                : item.nombre
            );

            opcion.value = item.id;
            entrada.append(opcion);
          }

          if (!datos[campo.lista].length) {
            grupo.append(
              elemento(
                "p",
                `Primero agrega registros en ${modulos[campo.lista].nombre}.`,
                "texto-panel"
              )
            );
          }
        } else {
          for (const texto of campo.opciones) {
            const opcion = elemento("option", texto);
            opcion.value = texto;
            entrada.append(opcion);
          }
        }
      } else if (campo.tipo === "textarea") {
        entrada = elemento("textarea");
        entrada.maxLength = 1000;
      } else {
        entrada = elemento("input");
        entrada.type = campo.tipo || "text";

        if (entrada.type !== "date") {
          entrada.maxLength = 160;
        }
      }

      entrada.id = idCampo;
      entrada.name = campo.clave;
      entrada.required = !campo.opcional;

      entrada.value =
        registro?.[campo.clave] ||
        (campo.tipo === "date" ? fechaActual() : "");

      grupo.prepend(label, entrada);
      formulario.append(grupo);
    }

    const mensaje = elemento("p", "", "mensaje-login");
    mensaje.setAttribute("role", "status");
    mensaje.setAttribute("aria-live", "polite");

    const guardarBtn = elemento(
      "button",
      registro ? "Guardar cambios" : "Guardar registro",
      "boton-principal"
    );

    guardarBtn.type = "submit";

    formulario.append(
      guardarBtn,
      boton("Cancelar", () => mostrarModulo(id)),
      mensaje
    );

    formulario.addEventListener("input", (evento) => {
      evento.target.setCustomValidity?.("");
    });

    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();

      for (const entrada of formulario.querySelectorAll(
        "input, textarea, select"
      )) {
        entrada.setCustomValidity("");

        if (entrada.required && !entrada.value.trim()) {
          entrada.setCustomValidity("Completa este campo.");
        }
      }

      if (!formulario.reportValidity()) return;

      const valores = new FormData(formulario);
      const nuevo = { id: registro?.id || identificar() };

      for (const campo of configuracion.campos) {
        nuevo[campo.clave] = String(
          valores.get(campo.clave) || ""
        ).trim();

        if (
          campo.lista &&
          !buscar(campo.lista, nuevo[campo.clave])
        ) {
          mensaje.textContent =
            "La opción seleccionada ya no está disponible.";
          return;
        }
      }

      if (registro) {
        const posicion = datos[id].findIndex(
          (item) => item.id === registro.id
        );

        if (posicion === -1) return;

        datos[id][posicion] = nuevo;
      } else {
        datos[id].push(nuevo);
      }

      const persistido = guardar();
      mostrarModulo(id);

      avisar(
        persistido
          ? "Registro guardado en este navegador."
          : "Registro disponible temporalmente. No se pudo guardar en el navegador."
      );

      contenido?.focus();
    });

    vista.append(formulario);
    formulario.querySelector("input, select, textarea")?.focus();
  }

  function mostrarModulo(id) {
    const configuracion = modulos[id];

    preparar(
      id,
      configuracion.nombre,
      configuracion.descripcion
    );

    const acciones = elemento("div", "", "demo-acciones");

    acciones.append(
      boton(
        "Agregar registro",
        () => formularioRegistro(id),
        "boton-principal"
      )
    );

    const grupoBusqueda = elemento(
      "div",
      "",
      "campo demo-busqueda"
    );

    const label = elemento("label", "Buscar registros");
    label.htmlFor = "buscar-registros";

    const busqueda = elemento("input");
    busqueda.id = "buscar-registros";
    busqueda.type = "search";

    grupoBusqueda.append(label, busqueda);

    const contador = elemento("p", "", "texto-panel");
    contador.setAttribute("role", "status");

    const lista = elemento("div", "", "demo-lista");

    function actualizarLista() {
      lista.replaceChildren();

      const texto = busqueda.value
        .trim()
        .toLocaleLowerCase("es");

      const encontrados = datos[id].filter((registro) =>
        configuracion.campos.some((campo) =>
          textoCampo(campo, registro[campo.clave])
            .toLocaleLowerCase("es")
            .includes(texto)
        )
      );

      contador.textContent =
        `${encontrados.length} registros encontrados.`;

      if (!encontrados.length) {
        lista.append(
          elemento(
            "p",
            datos[id].length
              ? "No hay coincidencias con tu búsqueda."
              : "Todavía no hay registros. Selecciona «Agregar registro».",
            "texto-panel"
          )
        );
      }

      for (const registro of encontrados) {
        const tarjeta = elemento(
          "article",
          "",
          "demo-registro"
        );

        tarjeta.append(
          elemento(
            "h3",
            registro.nombre ||
              (id === "solicitudes"
                ? nombreSolicitud(registro.id)
                : configuracion.nombre)
          )
        );

        for (const campo of configuracion.campos) {
          tarjeta.append(
            elemento(
              "p",
              `${campo.etiqueta}: ${textoCampo(
                campo,
                registro[campo.clave]
              )}`
            )
          );
        }

        const controles = elemento(
          "div",
          "",
          "demo-acciones"
        );

        controles.append(
          boton(
            "Editar",
            () => formularioRegistro(id, registro)
          ),

          boton("Eliminar", () => {
            if (tieneDependencias(id, registro.id)) {
              window.alert(
                "Este registro tiene datos relacionados. Elimina primero sus solicitudes, asignaciones o seguimientos."
              );
              return;
            }

            if (
              !window.confirm(
                "¿Eliminar este registro de demostración?"
              )
            ) {
              return;
            }

            datos[id] = datos[id].filter(
              (item) => item.id !== registro.id
            );

            const persistido = guardar();

            actualizarLista();

            avisar(
              persistido
                ? "Registro eliminado."
                : "Eliminado temporalmente. No se pudo guardar el cambio."
            );

            busqueda.focus();
          })
        );

        tarjeta.append(controles);
        lista.append(tarjeta);
      }
    }

    busqueda.addEventListener("input", actualizarLista);

    vista.append(
      elemento("h2", "Consulta y gestión"),
      acciones,
      grupoBusqueda,
      contador,
      lista
    );

    actualizarLista();
  }

  /* ======================================
     REPORTES
     ====================================== */

  function descargarReporte() {
    const filas = [
      ["Módulo", "Campo", "Valor", "Identificador"]
    ];

    for (const [id, configuracion] of Object.entries(modulos)) {
      for (const registro of datos[id]) {
        for (const campo of configuracion.campos) {
          filas.push([
            configuracion.nombre,
            campo.etiqueta,
            textoCampo(campo, registro[campo.clave]),
            registro.id
          ]);
        }
      }
    }

    function celda(valor) {
      let texto = String(valor ?? "");

      if (/^[\s]*[=+\-@]/.test(texto)) {
        texto = "'" + texto;
      }

      return `"${texto.replaceAll('"', '""')}"`;
    }

    const csv =
      "\uFEFF" +
      filas
        .map((fila) => fila.map(celda).join(";"))
        .join("\r\n");

    const archivo = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(archivo);
    const enlace = elemento("a");

    enlace.href = url;
    enlace.download =
      `accesia-reporte-demo-${fechaActual()}.csv`;

    document.body.append(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    avisar("Reporte de demostración descargado.");
  }

  function mostrarReportes() {
    preparar(
      "reportes",
      "Reportes",
      "Consulta los datos registrados en este navegador."
    );

    vista.append(
      elemento("h2", "Resumen de registros"),
      resumen()
    );

    for (const estadoSolicitud of [
      "Pendiente",
      "En atención",
      "Finalizada",
      "Cancelada"
    ]) {
      const cantidad = datos.solicitudes.filter(
        (solicitud) =>
          solicitud.estado === estadoSolicitud
      ).length;

      vista.append(
        elemento(
          "p",
          `Solicitudes con estado «${estadoSolicitud}»: ${cantidad}`,
          "texto-panel"
        )
      );
    }

    const acciones = elemento("div", "", "demo-acciones");

    acciones.append(
      boton(
        "Descargar reporte CSV",
        descargarReporte,
        "boton-principal"
      )
    );

    vista.append(acciones);
  }

  /* ======================================
     PLANES Y SUSCRIPCIONES
     ====================================== */

  function mostrarPlanes() {
    preparar(
      "planes",
      "Planes y suscripciones",
      "Elige un plan para tu institución."
    );

    const planes = [
      {
        nombre: "Básico",
        precio: 49,
        descripcion: "Para comenzar",
        recomendado: false,
        beneficios: [
          "Hasta 30 beneficiarios",
          "Gestión de servicios",
          "Solicitudes de apoyo"
        ]
      },
      {
        nombre: "Profesional",
        precio: 99,
        descripcion: "Para instituciones en crecimiento",
        recomendado: true,
        beneficios: [
          "Hasta 150 beneficiarios",
          "Personal y asignaciones",
          "Seguimiento de atenciones",
          "Reportes descargables"
        ]
      },
      {
        nombre: "Institucional",
        precio: 199,
        descripcion: "Para equipos de mayor alcance",
        recomendado: false,
        beneficios: [
          "Hasta 500 beneficiarios",
          "Todos los módulos",
          "Reportes de gestión",
          "Soporte prioritario"
        ]
      }
    ];

    const contenedor = elemento("div", "", "planes-grid");

    for (const plan of planes) {
      const seleccionado = datos.plan === plan.nombre;

      const tarjeta = elemento(
        "article",
        "",
        "plan-tarjeta"
      );

      if (plan.recomendado) {
        tarjeta.classList.add("plan-recomendado");
      }

      if (seleccionado) {
        tarjeta.classList.add("plan-seleccionado");
      }

      const identificador =
        `plan-${plan.nombre.toLowerCase()}`;

      tarjeta.setAttribute(
        "aria-labelledby",
        identificador
      );

      const cabecera = elemento(
        "div",
        "",
        "plan-cabecera"
      );

      const distintivos = elemento(
        "div",
        "",
        "plan-distintivos"
      );

      if (plan.recomendado) {
        distintivos.append(
          elemento(
            "span",
            "Recomendado",
            "plan-insignia"
          )
        );
      }

      if (seleccionado) {
        distintivos.append(
          elemento(
            "span",
            "✓ Plan seleccionado",
            "plan-insignia plan-insignia-activa"
          )
        );
      }

      const nombre = elemento("h2", plan.nombre);
      nombre.id = identificador;

      const precio = elemento("p", "", "plan-precio");

      precio.append(
        elemento("strong", `S/ ${plan.precio}`),
        elemento("span", "/ mes")
      );

      cabecera.append(
        distintivos,
        nombre,
        precio,
        elemento(
          "p",
          plan.descripcion,
          "plan-descripcion"
        )
      );

      const beneficios = elemento(
        "ul",
        "",
        "plan-beneficios"
      );

      for (const beneficio of plan.beneficios) {
        const item = elemento("li");
        const marca = elemento("span", "✓", "plan-check");

        marca.setAttribute("aria-hidden", "true");

        item.append(
          marca,
          elemento("span", beneficio)
        );

        beneficios.append(item);
      }

      const elegir = boton(
        seleccionado
          ? "Plan seleccionado"
          : "Seleccionar plan",

        () => {
          datos.plan = plan.nombre;
          const persistido = guardar();

          mostrarPlanes();

          const mensaje = persistido
            ? `Plan ${plan.nombre} seleccionado en esta demostración. No se generó ningún cobro.`
            : `Plan ${plan.nombre} seleccionado temporalmente. No se pudo guardar la selección.`;

          const confirmacion = document.getElementById(
            "confirmacion-plan"
          );

          if (confirmacion) {
            confirmacion.textContent = mensaje;
            confirmacion.focus();
          }

          avisar(mensaje);
        },

        "boton-principal plan-boton"
      );

      elegir.setAttribute(
        "aria-label",
        seleccionado
          ? `Plan ${plan.nombre} seleccionado`
          : `Seleccionar plan ${plan.nombre}, precio de ejemplo ${plan.precio} soles al mes`
      );

      elegir.disabled = seleccionado;

      tarjeta.append(
        cabecera,
        beneficios,
        elegir
      );

      contenedor.append(tarjeta);
    }

    const confirmacion = elemento(
      "p",
      datos.plan
        ? `Plan seleccionado: ${datos.plan}. Selección de demostración, sin cobros.`
        : "Selecciona un plan para probar esta pantalla.",
      "plan-confirmacion"
    );

    confirmacion.id = "confirmacion-plan";
    confirmacion.tabIndex = -1;
    confirmacion.setAttribute("role", "status");
    confirmacion.setAttribute("aria-live", "polite");

    vista.append(
      contenedor,
      confirmacion,
      elemento(
        "p",
        "Precios y beneficios de ejemplo · Sin cobros reales. Los límites mostrados no se aplican a esta demostración.",
        "planes-nota"
      )
    );
  }

  /* ======================================
     PERFIL BENEFICIARIO
     ====================================== */

  function mostrarServiciosBeneficiario() {
    preparar(
      "servicios-disponibles",
      "Servicios disponibles",
      "Consulta los servicios de esta demostración."
    );

    const disponibles = datos.servicios.filter(
      (servicio) => servicio.estado === "Disponible"
    );

    if (!disponibles.length) {
      vista.append(
        elemento(
          "p",
          "Todavía no hay servicios disponibles. Puedes agregarlos desde el panel institucional de demostración.",
          "texto-panel"
        )
      );
      return;
    }

    const lista = elemento("div", "", "demo-lista");

    for (const servicio of disponibles) {
      const tarjeta = elemento(
        "article",
        "",
        "demo-registro"
      );

      tarjeta.append(
        elemento("h3", servicio.nombre),
        elemento("p", servicio.descripcion),
        elemento("p", `Horario: ${servicio.horario}`)
      );

      lista.append(tarjeta);
    }

    vista.append(lista);
  }

  function mostrarPendiente(id, nombre) {
    preparar(
      id,
      nombre,
      "Pantalla del perfil beneficiario."
    );

    vista.append(
      elemento("h2", nombre),
      elemento(
        "p",
        "Este flujo está pendiente de implementación. Todavía no hay una cuenta identificada ni un asistente IA conectado.",
        "texto-panel"
      )
    );
  }

  /* ======================================
     CONSTRUCCIÓN DEL MENÚ LATERAL
     ====================================== */

  function opcion(id, nombre, icono, accion) {
    const control = elemento(
      "button",
      "",
      "opcion-menu"
    );

    control.type = "button";
    control.dataset.modulo = id;

    const simbolo = elemento("span", icono);
    simbolo.setAttribute("aria-hidden", "true");

    control.append(
      simbolo,
      elemento("span", nombre)
    );

    control.addEventListener("click", () => {
      accion();
      contenido?.focus();
      avisar(`Módulo ${nombre}.`);
    });

    menu.append(control);
  }

  menu.replaceChildren();

  opcion(
    "inicio",
    "Inicio",
    "⌂",
    mostrarInicio
  );

  if (institucional) {
    for (const [id, configuracion] of Object.entries(modulos)) {
      opcion(
        id,
        configuracion.nombre,
        configuracion.icono,
        () => mostrarModulo(id)
      );
    }

    opcion(
      "reportes",
      "Reportes",
      "▤",
      mostrarReportes
    );

    opcion(
      "planes",
      "Planes y suscripciones",
      "◇",
      mostrarPlanes
    );
  } else {
    opcion(
      "servicios-disponibles",
      "Servicios disponibles",
      "▦",
      mostrarServiciosBeneficiario
    );

    for (const [id, nombre, icono] of [
      ["solicitar", "Solicitar apoyo", "+"],
      ["mis-solicitudes", "Mis solicitudes", "▤"],
      ["asistente", "Asistente IA", "✧"]
    ]) {
      opcion(
        id,
        nombre,
        icono,
        () => mostrarPendiente(id, nombre)
      );
    }
  }

  /* ======================================
     ACCESIBILIDAD
     ====================================== */

  const textoBtn = document.getElementById("texto-btn");
  const contrasteBtn = document.getElementById("contraste-btn");
  const leerBtn = document.getElementById("leer-btn");

  textoBtn?.addEventListener("click", () => {
    const activo =
      document.documentElement.classList.toggle(
        "texto-grande"
      );

    textoBtn.setAttribute(
      "aria-pressed",
      String(activo)
    );

    avisar(
      activo
        ? "Texto aumentado."
        : "Tamaño de texto normal."
    );
  });

  contrasteBtn?.addEventListener("click", () => {
    const activo =
      document.body.classList.toggle(
        "alto-contraste"
      );

    contrasteBtn.setAttribute(
      "aria-pressed",
      String(activo)
    );

    avisar(
      activo
        ? "Alto contraste activado."
        : "Alto contraste desactivado."
    );
  });

  let leyendo = false;

  function finalizarLectura() {
    leyendo = false;

    if (leerBtn) {
      leerBtn.textContent = "▶ Leer página";
    }
  }

  function detenerLectura() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    finalizarLectura();
  }

  if (leerBtn) {
    if ("speechSynthesis" in window) {
      leerBtn.addEventListener("click", () => {
        if (leyendo) {
          detenerLectura();
          return;
        }

        window.speechSynthesis.cancel();

        const lectura = new SpeechSynthesisUtterance(
          `AccesIA. ${
            contenido?.innerText || titulo.textContent
          }`
        );

        lectura.lang = "es-PE";
        lectura.rate = 0.95;
        lectura.onend = finalizarLectura;
        lectura.onerror = finalizarLectura;

        leyendo = true;
        leerBtn.textContent = "■ Detener lectura";

        window.speechSynthesis.speak(lectura);
      });
    } else {
      leerBtn.disabled = true;
      leerBtn.textContent = "Lectura no disponible";
    }
  }

  window.addEventListener(
    "pagehide",
    detenerLectura
  );

  /* ======================================
     AYUDA
     ====================================== */

  const dialogo = document.getElementById("dialogo");
  const tituloDialogo =
    document.getElementById("dialogo-titulo");
  const textoDialogo =
    document.getElementById("dialogo-texto");

  document.getElementById("ayuda-btn")?.addEventListener(
    "click",
    () => {
      detenerLectura();

      const textoAyuda = institucional
        ? "Primero registra beneficiarios, servicios y personal. Luego crea solicitudes, asigna responsables y registra seguimientos. En Reportes puedes descargar un archivo CSV. En Planes y suscripciones puedes elegir un plan de ejemplo, sin cobros. Los datos se guardan solo en este navegador. Usa Tab para navegar y Enter para activar los controles."
        : "Selecciona Servicios disponibles para consultar la oferta de demostración. Los demás flujos del beneficiario están pendientes. Puedes aumentar el texto, activar el contraste o escuchar el contenido.";

      if (tituloDialogo) {
        tituloDialogo.textContent = "Ayuda de AccesIA";
      }

      if (textoDialogo) {
        textoDialogo.textContent = textoAyuda;
      }

      if (dialogo?.showModal) {
        if (!dialogo.open) dialogo.showModal();
      } else {
        window.alert(textoAyuda);
      }
    }
  );

  document.getElementById("cerrar-dialogo")?.addEventListener(
    "click",
    () => dialogo?.close()
  );

  mostrarInicio();
})();