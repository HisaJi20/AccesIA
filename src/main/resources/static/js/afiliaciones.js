
"use strict";

/* =========================================
   ACCESIA - AFILIACIONES INSTITUCIONALES
   PANEL BENEFICIARIO + PANEL INSTITUCIONAL
   MYSQL / SPRING BOOT / CSRF
========================================= */

(() => {

  const $ = id => document.getElementById(id);

  const esInstitucion =
    Boolean($("vista-dashboard") && $("vista-beneficiarios"));

  const esBeneficiario =
    Boolean($("menu-modulos") && $("panel-inicio"));

  if (!esInstitucion && !esBeneficiario) return;

  let afiliacionesBeneficiario = [];

  /* =========================================
     UTILIDADES
  ========================================= */

  function crear(tag, clase = "", contenido = "") {
    const nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    nodo.textContent = String(contenido ?? "");
    return nodo;
  }

  function aviso(id, texto, error = false) {
    const nodo = $(id);
    if (!nodo) return;

    nodo.textContent = texto;
    nodo.dataset.error = String(error);
  }

  function fecha(valor) {
    if (!valor) return "Sin fecha";

    const partes = String(valor).slice(0, 10).split("-");

    return partes.length === 3
      ? `${partes[2]}/${partes[1]}/${partes[0]}`
      : String(valor);
  }

  function estadoVisual(estado) {
    const nombres = {
      PENDIENTE: "Pendiente",
      APROBADA: "Aprobada",
      RECHAZADA: "Rechazada"
    };

    const estilos = {
      PENDIENTE: "af-pendiente",
      APROBADA: "af-aprobada",
      RECHAZADA: "af-rechazada"
    };

    return crear(
      "span",
      `af-badge ${estilos[estado] || ""}`,
      nombres[estado] || estado
    );
  }

  function vacio(mensaje) {
    return crear("div", "af-vacio", mensaje);
  }

  async function consultar(url, opciones = {}) {

    let respuesta;

    try {
      respuesta = await fetch(url, {
        credentials: "same-origin",
        cache: "no-store",
        ...opciones,
        headers: {
          Accept: "application/json",
          ...(opciones.headers || {})
        }
      });
    } catch {
      throw new Error(
        "No se pudo conectar con AccesIA. Comprueba que Spring Boot esté ejecutándose."
      );
    }

    if (respuesta.status === 401 ||
        respuesta.status === 403) {
      throw new Error(
        "Acceso denegado o sesión expirada. Comprueba que hayas iniciado sesión con la cuenta correcta."
      );
    }

    const tipo = respuesta.headers.get("content-type") || "";

    if (!tipo.includes("application/json")) {
      throw new Error(
        "El servidor no devolvió datos JSON. Revisa que la API de afiliaciones esté implementada."
      );
    }

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.detail ||
        datos.mensaje ||
        datos.message ||
        `Error HTTP ${respuesta.status}`
      );
    }

    return datos;
  }

  async function enviar(url, metodo, datos) {

    const token = await consultar("/api/auth/csrf");

    if (!token.headerName || !token.token) {
      throw new Error(
        "No se pudo obtener el token CSRF."
      );
    }

    return consultar(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        [token.headerName]: token.token
      },
      body: JSON.stringify(datos)
    });
  }

  function tarjeta(titulo, descripcion) {

    const contenedor = crear("article", "af-tarjeta");
    const informacion = crear("div", "af-info");

    informacion.append(
      crear("h3", "", titulo),
      crear("p", "", descripcion)
    );

    contenedor.append(informacion);

    return {
      contenedor,
      informacion
    };
  }

  /* =========================================
     INSTALAR PANEL DEL BENEFICIARIO
  ========================================= */

  function instalarBeneficiario() {

    const menu = $("menu-modulos");

    if (!menu) return;

    let boton = menu.querySelector(
      '[data-view="instituciones"]'
    );

    if (!boton) {

      boton = document.createElement("button");

      boton.type = "button";
      boton.className = "nav-item";
      boton.dataset.view = "instituciones";

      boton.innerHTML = `
        <span class="nav-icono" aria-hidden="true">▣</span>
        Mis instituciones
      `;

      const referencia = menu.querySelector(
        '[data-view="servicios"]'
      );

      if (referencia) {
        menu.insertBefore(boton, referencia);
      } else {
        menu.append(boton);
      }
    }

    let seccion = $("panel-instituciones");

    if (!seccion) {

      seccion = document.createElement("section");

      seccion.id = "panel-instituciones";
      seccion.className = "panel-section af-vista";
      seccion.hidden = true;

      const referencia = $("panel-servicios");

      if (referencia) {
        referencia.before(seccion);
      } else {
        $("contenido").append(seccion);
      }
    }

    seccion.classList.add("panel-section", "af-vista");

    seccion.innerHTML = `
      <div class="af-hero">
        <span class="af-eyebrow">
          VINCULACIÓN INSTITUCIONAL
        </span>

        <h1>Mis instituciones</h1>

        <p>
          Encuentra una institución registrada en AccesIA,
          solicita tu afiliación y consulta el estado de
          tus solicitudes.
        </p>
      </div>

      <div class="af-panel">

        <div class="af-cabecera">
          <div>
            <span class="af-eyebrow">MI ACTIVIDAD</span>
            <h2>Mis afiliaciones</h2>
            <p>
              Consulta las instituciones con las que
              has solicitado vincularte.
            </p>
          </div>
        </div>

        <div id="af-mis"
             class="af-lista"
             aria-live="polite">
          Todavía no has consultado tus afiliaciones.
        </div>

      </div>

      <div class="af-panel">

        <div class="af-cabecera">
          <div>
            <span class="af-eyebrow">DIRECTORIO</span>
            <h2>Buscar instituciones</h2>
            <p>
              Selecciona una institución para solicitar
              que te incorpore como beneficiario.
            </p>
          </div>
        </div>

        <form id="af-buscador" class="af-form">

          <label for="af-consulta">
            Nombre de la institución
          </label>

          <div class="af-buscador">
            <input id="af-consulta"
                   type="search"
                   maxlength="80"
                   placeholder="Ej. Municipalidad"
                   autocomplete="off">

            <button type="submit" class="af-boton">
              Buscar
            </button>
          </div>

        </form>

        <p id="af-estado-b"
           class="af-aviso"
           role="status"
           aria-live="polite"></p>

        <div id="af-resultados"
             class="af-lista"
             aria-live="polite">
          Ingresa el nombre de una institución
          o presiona Buscar.
        </div>

      </div>
    `;

    boton.addEventListener("click", () => {
      cargarBeneficiario();
    });

    $("af-buscador").addEventListener(
      "submit",
      async evento => {

        evento.preventDefault();

        try {
          await buscarInstituciones();
        } catch (error) {
          aviso("af-estado-b", error.message, true);
        }
      }
    );
  }

  /* =========================================
     MIS AFILIACIONES DEL BENEFICIARIO
  ========================================= */

  async function cargarMisAfiliaciones() {

    const datos = await consultar(
      "/api/beneficiarios/afiliaciones"
    );

    afiliacionesBeneficiario = datos;

    const destino = $("af-mis");

    destino.replaceChildren();

    if (!datos.length) {

      destino.append(
        vacio(
          "Todavía no tienes solicitudes de afiliación."
        )
      );

      return;
    }

    for (const afiliacion of datos) {

      const t = tarjeta(
        afiliacion.institucion,
        "Solicitud registrada el " +
        fecha(afiliacion.fechaSolicitud)
      );

      t.informacion.append(
        estadoVisual(afiliacion.estado)
      );

      if (afiliacion.estado === "RECHAZADA") {
        t.informacion.append(
          crear(
            "p",
            "",
            "Puedes enviar una nueva solicitud desde el buscador."
          )
        );
      }

      destino.append(t.contenedor);
    }
  }

  /* =========================================
     BUSCAR INSTITUCIONES
  ========================================= */

  async function buscarInstituciones() {

    const consulta = $("af-consulta").value.trim();

    aviso("af-estado-b", "Buscando instituciones...");

    const instituciones = await consultar(
      "/api/beneficiarios/instituciones?q=" +
      encodeURIComponent(consulta)
    );

    const destino = $("af-resultados");

    destino.replaceChildren();

    if (!instituciones.length) {

      destino.append(
        vacio(
          "No se encontraron instituciones activas."
        )
      );

      aviso(
        "af-estado-b",
        "No se encontraron resultados."
      );

      return;
    }

    for (const institucion of instituciones) {

      const ubicacion = [
        institucion.distrito,
        institucion.provincia
      ].filter(Boolean).join(", ");

      const detalle = [
        institucion.tipoInstitucion,
        ubicacion
      ].filter(Boolean).join(" · ");

      const t = tarjeta(
        institucion.razonSocial,
        detalle || "Institución registrada en AccesIA"
      );

      const acciones = crear("div", "af-acciones");

      const existente = afiliacionesBeneficiario.find(
        a => a.idInstitucion === institucion.idInstitucion
      );

      if (
        existente &&
        existente.estado !== "RECHAZADA"
      ) {

        acciones.append(
          estadoVisual(existente.estado)
        );

      } else {

        const boton = crear(
          "button",
          "af-boton",
          existente
            ? "Volver a solicitar"
            : "Solicitar afiliación"
        );

        boton.type = "button";

        boton.addEventListener("click", async () => {

          const confirmar = window.confirm(
            "¿Deseas solicitar afiliación a " +
            institucion.razonSocial +
            "? La institución recibirá tu nombre y correo " +
            "para revisar la solicitud."
          );

          if (!confirmar) return;

          boton.disabled = true;

          aviso(
            "af-estado-b",
            "Enviando solicitud..."
          );

          try {

            await enviar(
              "/api/beneficiarios/afiliaciones",
              "POST",
              {
                idInstitucion: institucion.idInstitucion
              }
            );

            await cargarMisAfiliaciones();
            await buscarInstituciones();

            aviso(
              "af-estado-b",
              "Solicitud enviada. Está pendiente de aprobación."
            );

          } catch (error) {

            aviso(
              "af-estado-b",
              error.message,
              true
            );

            boton.disabled = false;
          }
        });

        acciones.append(boton);
      }

      t.contenedor.append(acciones);
      destino.append(t.contenedor);
    }

    aviso(
      "af-estado-b",
      `${instituciones.length} instituciones encontradas.`
    );
  }

  async function cargarBeneficiario() {

    aviso(
      "af-estado-b",
      "Actualizando tus instituciones..."
    );

    try {

      await cargarMisAfiliaciones();
      await buscarInstituciones();

    } catch (error) {

      aviso("af-estado-b", error.message, true);
    }
  }

  /* =========================================
     INSTALAR PANEL INSTITUCIONAL
  ========================================= */

  function instalarInstitucion() {

    const menu = document.querySelector(
      ".sidebar-nav"
    );

    if (!menu) return;

    let boton = menu.querySelector(
      '[data-view="afiliaciones"], [data-af-tab="institucion"]'
    );

    if (!boton) {

      boton = document.createElement("button");

      boton.type = "button";
      boton.className = "nav-item";

      boton.innerHTML = `
        <svg class="icon" aria-hidden="true">
          <use href="#ico-users"></use>
        </svg>
        <span>Afiliaciones</span>
      `;

      const referencia = menu.querySelector(
        '[data-view="servicios"]'
      );

      if (referencia) {
        menu.insertBefore(boton, referencia);
      } else {
        menu.append(boton);
      }
    }

    // Controlamos esta sección independientemente
    // para no modificar el dashboard institucional.
    boton.removeAttribute("data-view");

    boton.dataset.afTab = "institucion";

    let seccion = $("vista-afiliaciones");

    if (!seccion) {

      seccion = document.createElement("section");

      seccion.id = "vista-afiliaciones";
      seccion.className = "af-vista";
      seccion.hidden = true;

      const modulo = $("vista-modulo");

      if (modulo) {
        modulo.before(seccion);
      } else {
        $("contenido").append(seccion);
      }
    }

    seccion.classList.add("af-vista");

    seccion.innerHTML = `
      <div class="af-hero">

        <span class="af-eyebrow">
          ADMINISTRACIÓN INSTITUCIONAL
        </span>

        <h2>Solicitudes de afiliación</h2>

        <p>
          Consulta y evalúa las solicitudes de
          personas que desean vincularse
          con tu institución.
        </p>

      </div>

      <div class="af-panel">

        <div class="af-cabecera">

          <div>
            <span class="af-eyebrow">
              GESTIÓN DE VINCULACIONES
            </span>

            <h3>Solicitudes recibidas</h3>

            <p>
              Verifica la identidad del beneficiario
              antes de aprobar una solicitud.
            </p>
          </div>

          <button id="af-recargar"
                  type="button"
                  class="af-boton-secundario">
            Actualizar listado
          </button>

        </div>

        <p id="af-estado-i"
           class="af-aviso"
           role="status"
           aria-live="polite"></p>

        <div id="af-pendientes"
             class="af-lista"
             aria-live="polite">
          Selecciona Actualizar listado.
        </div>

      </div>
    `;

    boton.addEventListener("click", evento => {

      evento.preventDefault();
      evento.stopPropagation();

      $("vista-dashboard").hidden = true;
      $("vista-beneficiarios").hidden = true;
      $("vista-modulo").hidden = true;

      seccion.hidden = false;

      const titulo = $("titulo-superior");

      if (titulo) {
        titulo.textContent = "Afiliaciones";
      }

      menu.querySelectorAll(".nav-item")
        .forEach(item => {

          item.classList.remove("active");
          item.removeAttribute("aria-current");
        });

      boton.classList.add("active");
      boton.setAttribute("aria-current", "page");

      const estado = $("estado-accesible");

      if (estado) {
        estado.textContent =
          "Vista seleccionada: Afiliaciones";
      }

      $("contenido").focus({
        preventScroll: true
      });

      cargarSolicitudesInstitucion();
    });

    // Al cambiar a otro módulo, ocultar afiliaciones.
    document.addEventListener("click", evento => {

      const otroModulo = evento.target.closest(
        "[data-view]"
      );

      if (!otroModulo) return;

      seccion.hidden = true;

      boton.classList.remove("active");
      boton.removeAttribute("aria-current");
    });

    $("af-recargar").addEventListener(
      "click",
      cargarSolicitudesInstitucion
    );
  }

  /* =========================================
     SOLICITUDES INSTITUCIONALES
  ========================================= */

  function mostrarSolicitudes(datos) {

    const destino = $("af-pendientes");

    destino.replaceChildren();

    if (!datos.length) {

      destino.append(
        vacio(
          "Tu institución todavía no ha recibido solicitudes."
        )
      );

      return;
    }

    const ordenadas = [...datos].sort((a, b) => {

      if (
        a.estado === "PENDIENTE" &&
        b.estado !== "PENDIENTE"
      ) return -1;

      if (
        b.estado === "PENDIENTE" &&
        a.estado !== "PENDIENTE"
      ) return 1;

      return 0;
    });

    for (const afiliacion of ordenadas) {

      const t = tarjeta(
        afiliacion.beneficiario,
        afiliacion.correoBeneficiario
      );

      t.informacion.append(
        crear(
          "p",
          "",
          "Fecha: " + fecha(afiliacion.fechaSolicitud)
        ),
        estadoVisual(afiliacion.estado)
      );

      if (afiliacion.estado === "PENDIENTE") {

        const acciones = crear("div", "af-acciones");

        for (const accion of ["APROBAR", "RECHAZAR"]) {

          const boton = crear(
            "button",
            accion === "APROBAR"
              ? "af-boton"
              : "af-boton-secundario",
            accion === "APROBAR"
              ? "Aprobar"
              : "Rechazar"
          );

          boton.type = "button";

          boton.addEventListener(
            "click",
            async () => {

              const mensaje = accion === "APROBAR"
                ? "Confirma que has verificado la identidad " +
                  "del beneficiario. ¿Deseas aprobar?"
                : "¿Deseas rechazar esta solicitud?";

              if (!window.confirm(mensaje)) {
                return;
              }

              const botones = acciones.querySelectorAll(
                "button"
              );

              botones.forEach(b => {
                b.disabled = true;
              });

              aviso(
                "af-estado-i",
                "Guardando decisión..."
              );

              try {

                await enviar(
                  "/api/instituciones/afiliaciones/" +
                  afiliacion.idAfiliacion +
                  "/decision",
                  "PUT",
                  { accion }
                );

                await cargarSolicitudesInstitucion();

              } catch (error) {

                aviso(
                  "af-estado-i",
                  error.message,
                  true
                );

                botones.forEach(b => {
                  b.disabled = false;
                });
              }
            }
          );

          acciones.append(boton);
        }

        t.contenedor.append(acciones);
      }

      destino.append(t.contenedor);
    }
  }

  async function cargarSolicitudesInstitucion() {

    aviso(
      "af-estado-i",
      "Consultando solicitudes..."
    );

    try {

      const datos = await consultar(
        "/api/instituciones/afiliaciones"
      );

      mostrarSolicitudes(datos);

      const pendientes = datos.filter(
        a => a.estado === "PENDIENTE"
      ).length;

      aviso(
        "af-estado-i",
        `${pendientes} solicitudes pendientes de revisión.`
      );

    } catch (error) {

      aviso(
        "af-estado-i",
        error.message,
        true
      );
    }
  }

  /* =========================================
     INICIALIZACIÓN
  ========================================= */

  if (esBeneficiario) {
    instalarBeneficiario();
  }

  if (esInstitucion) {
    instalarInstitucion();
  }

})();
