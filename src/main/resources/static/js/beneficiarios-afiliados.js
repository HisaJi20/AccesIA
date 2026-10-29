
"use strict";

/* =========================================
   ACCESIA - BENEFICIARIOS AFILIADOS

   Pestañas: Registrados / Afiliados
   API: Spring Boot + MySQL
   Diseño: Claro / Oscuro
========================================= */

(() => {

  const $ = id => document.getElementById(id);

  const vista = $("vista-beneficiarios");

  if (!vista) return;

  const hero = vista.querySelector(".benef-hero");

  if (!hero) return;

  // Elementos originales que NO se reemplazan.
  const seccionesRegistrados = Array.from(
    vista.children
  ).filter(elemento =>
    elemento.matches(
      ".benef-stats, .benef-filter-card, .benef-table-card"
    )
  );

  const accionesRegistro = hero.querySelector(
    ".benef-hero-actions"
  );

  let paginaActual = 0;
  let paginaTotal = 0;
  let registrosTotales = 0;
  let solicitudesEnCurso = 0;

  /* =========================================
     UTILIDADES
  ========================================= */

  function crear(
    etiqueta,
    clase = "",
    texto = ""
  ) {

    const elemento = document.createElement(etiqueta);

    if (clase) {
      elemento.className = clase;
    }

    elemento.textContent = String(texto ?? "");

    return elemento;
  }

  function textoSeguro(valor, alternativo = "No registrado") {
    if (valor === null ||
        valor === undefined ||
        String(valor).trim() === "") {
      return alternativo;
    }

    return String(valor);
  }

  function fechaLegible(valor) {

    if (!valor) return "No registrada";

    const partes = String(valor)
      .slice(0, 10)
      .split("-");

    if (partes.length !== 3) {
      return String(valor);
    }

    return [
      partes[2],
      partes[1],
      partes[0]
    ].join("/");
  }

  function anunciar(texto, error = false) {

    const estado = $("ba-estado");

    if (estado) {
      estado.textContent = texto;
      estado.dataset.error = String(error);
    }

    const lector = $("estado-accesible");

    if (lector) {
      lector.textContent = texto;
    }
  }

  async function consultar(url) {

    let respuesta;

    try {

      respuesta = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          Accept: "application/json"
        }
      });

    } catch {

      throw new Error(
        "No fue posible conectar con Spring Boot."
      );
    }

    if (
      respuesta.redirected ||
      respuesta.status === 401 ||
      respuesta.status === 403
    ) {

      throw new Error(
        "La sesión institucional no es válida. " +
        "Inicia sesión nuevamente."
      );
    }

    if (respuesta.status === 404) {

      throw new Error(
        "No se encontró el servicio de beneficiarios afiliados. " +
        "Comprueba que el backend esté actualizado."
      );
    }

    if (!respuesta.ok) {

      throw new Error(
        "La consulta falló. Código HTTP: " +
        respuesta.status
      );
    }

    const tipo = respuesta.headers.get(
      "content-type"
    ) || "";

    if (!tipo.includes("application/json")) {

      throw new Error(
        "La API no devolvió información JSON válida."
      );
    }

    return respuesta.json();
  }

  /* =========================================
     CREAR PESTAÑAS EN EL PANEL EXISTENTE
  ========================================= */

  const pestanas = crear("div", "ba-pestanas");

  pestanas.setAttribute(
    "role",
    "group"
  );

  pestanas.setAttribute(
    "aria-label",
    "Tipo de beneficiarios"
  );

  const botonRegistrados = crear(
    "button",
    "ba-pestana",
    "Registrados"
  );

  botonRegistrados.type = "button";
  botonRegistrados.id = "ba-boton-registrados";

  const botonAfiliados = crear(
    "button",
    "ba-pestana",
    "Afiliados"
  );

  botonAfiliados.type = "button";
  botonAfiliados.id = "ba-boton-afiliados";

  pestanas.append(
    botonRegistrados,
    botonAfiliados
  );

  hero.after(pestanas);

  /* =========================================
     CREAR CONTENEDOR DE AFILIADOS
  ========================================= */

  const contenedor = crear(
    "section",
    "ba-contenedor"
  );

  contenedor.id = "ba-panel-afiliados";
  contenedor.hidden = true;

  contenedor.innerHTML = `
    <div class="ba-encabezado">

      <div>
        <span class="ba-eyebrow">
          VINCULACIÓN INSTITUCIONAL
        </span>

        <h3>
          Beneficiarios afiliados
        </h3>

        <p>
          Personas cuya afiliación fue aprobada
          por tu institución.
        </p>
      </div>

      <button
        id="ba-actualizar"
        type="button"
        class="ba-boton-secundario">
        Actualizar listado
      </button>

    </div>

    <div class="ba-resumen">

      <div class="ba-indicador">
        <span>Total de afiliados</span>
        <strong id="ba-total">—</strong>
      </div>

      <div class="ba-indicador">
        <span>Estado institucional</span>
        <strong>Vinculación aprobada</strong>
      </div>

    </div>

    <p
      id="ba-estado"
      class="ba-mensaje"
      role="status"
      aria-live="polite">
    </p>

    <div class="ba-tabla-scroll">

      <table class="ba-tabla">

        <thead>
          <tr>
            <th scope="col">
              Beneficiario
            </th>

            <th scope="col">
              Correo electrónico
            </th>

            <th scope="col">
              Fecha de aprobación
            </th>

            <th scope="col">
              Estado
            </th>

            <th scope="col">
              Acción
            </th>
          </tr>
        </thead>

        <tbody id="ba-tabla-cuerpo">
          <tr>
            <td colspan="5">
              Selecciona Afiliados para cargar el listado.
            </td>
          </tr>
        </tbody>

      </table>

    </div>

    <div class="ba-paginacion">

      <span id="ba-rango">
        Sin registros consultados
      </span>

      <div class="ba-pagina-acciones">

        <button
          id="ba-anterior"
          class="ba-boton-secundario"
          type="button"
          disabled>
          Anterior
        </button>

        <span id="ba-pagina-actual">
          Página —
        </span>

        <button
          id="ba-siguiente"
          class="ba-boton-secundario"
          type="button"
          disabled>
          Siguiente
        </button>

      </div>

    </div>

  `;

  pestanas.after(contenedor);

  /* =========================================
     CAMBIO ENTRE PESTAÑAS
  ========================================= */

  function seleccionarPestana(tipo) {

    const mostrarRegistrados =
      tipo === "registrados";

    botonRegistrados.classList.toggle(
      "ba-activa",
      mostrarRegistrados
    );

    botonAfiliados.classList.toggle(
      "ba-activa",
      !mostrarRegistrados
    );

    botonRegistrados.setAttribute(
      "aria-pressed",
      String(mostrarRegistrados)
    );

    botonAfiliados.setAttribute(
      "aria-pressed",
      String(!mostrarRegistrados)
    );

    // Los módulos antiguos permanecen intactos.
    seccionesRegistrados.forEach(seccion => {
      seccion.hidden = !mostrarRegistrados;
    });

    if (accionesRegistro) {
      accionesRegistro.hidden = !mostrarRegistrados;
    }

    // Mostrar u ocultar la nueva sección.
    contenedor.hidden = mostrarRegistrados;

    if (!mostrarRegistrados) {
      cargarAfiliados(0);
    }
  }

  botonRegistrados.addEventListener(
    "click",
    () => {
      seleccionarPestana("registrados");
    }
  );

  botonAfiliados.addEventListener(
    "click",
    () => {
      seleccionarPestana("afiliados");
    }
  );

  /* =========================================
     TABLA DE BENEFICIARIOS AFILIADOS
  ========================================= */

  const cuerpo = $("ba-tabla-cuerpo");

  function mostrarFilaMensaje(mensaje) {

    const fila = document.createElement("tr");
    const celda = document.createElement("td");

    celda.colSpan = 5;
    celda.className = "ba-vacio";
    celda.textContent = mensaje;

    fila.append(celda);
    cuerpo.replaceChildren(fila);
  }

  function celdaTexto(valor, clase = "") {

    const celda = crear(
      "td",
      clase,
      valor
    );

    return celda;
  }

  function crearFila(afiliado) {

    const fila = document.createElement("tr");

    const nombre = celdaTexto(
      textoSeguro(afiliado.nombreCompleto),
      "ba-nombre"
    );

    const correo = celdaTexto(
      textoSeguro(afiliado.correo)
    );

    const fecha = celdaTexto(
      fechaLegible(afiliado.fechaAprobacion)
    );

    const estado = document.createElement("td");

    estado.append(
      crear(
        "span",
        "ba-etiqueta-aprobada",
        "Aprobada"
      )
    );

    const acciones = document.createElement("td");

    const boton = crear(
      "button",
      "ba-boton",
      "Ver ficha"
    );

    boton.type = "button";

    boton.setAttribute(
      "aria-label",
      "Ver ficha de " +
      textoSeguro(afiliado.nombreCompleto)
    );

    boton.addEventListener(
      "click",
      async () => {

        boton.disabled = true;
        boton.textContent = "Consultando...";

        try {

          await abrirFicha(
            afiliado.idAfiliacion
          );

        } catch (error) {

          anunciar(
            error.message,
            true
          );

        } finally {

          boton.disabled = false;
          boton.textContent = "Ver ficha";
        }
      }
    );

    acciones.append(boton);

    fila.append(
      nombre,
      correo,
      fecha,
      estado,
      acciones
    );

    return fila;
  }

  /* =========================================
     CARGAR REGISTROS DE MYSQL
  ========================================= */

  async function cargarAfiliados(pagina = 0) {

    const solicitudActual = ++solicitudesEnCurso;

    anunciar(
      "Consultando beneficiarios afiliados..."
    );

    mostrarFilaMensaje(
      "Cargando datos de MySQL..."
    );

    $("ba-anterior").disabled = true;
    $("ba-siguiente").disabled = true;

    try {

      const respuesta = await consultar(
        "/api/instituciones/beneficiarios-afiliados" +
        "?pagina=" + pagina
      );

      if (solicitudActual !== solicitudesEnCurso) {
        return;
      }

      const lista = respuesta.content || [];

      paginaActual = respuesta.number ?? pagina;
      paginaTotal = respuesta.totalPages ?? 0;
      registrosTotales =
        respuesta.totalElements ?? lista.length;

      $("ba-total").textContent =
        registrosTotales.toLocaleString("es-PE");

      $("ba-pagina-actual").textContent =
        paginaTotal === 0
          ? "Página —"
          : `Página ${paginaActual + 1} de ${paginaTotal}`;

      $("ba-anterior").disabled =
        paginaActual <= 0;

      $("ba-siguiente").disabled =
        paginaActual + 1 >= paginaTotal;

      cuerpo.replaceChildren();

      if (!lista.length) {

        mostrarFilaMensaje(
          "Todavía no hay beneficiarios con " +
          "afiliación aprobada en tu institución."
        );

        $("ba-rango").textContent =
          "Sin beneficiarios afiliados";

        anunciar(
          "No se encontraron afiliados aprobados."
        );

        return;
      }

      lista.forEach(afiliado => {
        cuerpo.append(
          crearFila(afiliado)
        );
      });

      const inicio =
        paginaActual * 10 + 1;

      const fin =
        inicio + lista.length - 1;

      $("ba-rango").textContent =
        `Mostrando ${inicio}–${fin} ` +
        `de ${registrosTotales} afiliados`;

      anunciar(
        `${registrosTotales} beneficiarios ` +
        "afiliados encontrados."
      );

    } catch (error) {

      if (solicitudActual !== solicitudesEnCurso) {
        return;
      }

      mostrarFilaMensaje(
        error.message
      );

      $("ba-total").textContent = "—";

      anunciar(
        error.message,
        true
      );
    }
  }

  /* =========================================
     FICHA CONSULTABLE
  ========================================= */

  const dialogo = document.createElement("dialog");

  dialogo.id = "ba-dialogo";
  dialogo.className = "ba-dialogo";

  dialogo.setAttribute(
    "aria-labelledby",
    "ba-ficha-titulo"
  );

  dialogo.innerHTML = `
    <div class="ba-dialogo-contenido">

      <div class="ba-dialogo-encabezado">

        <div>

          <span class="ba-eyebrow">
            EXPEDIENTE DE AFILIACIÓN
          </span>

          <h2 id="ba-ficha-titulo">
            Ficha del beneficiario
          </h2>

          <p>
            Datos básicos asociados a la cuenta
            y su vinculación institucional.
          </p>

        </div>

        <button
          type="button"
          id="ba-cerrar"
          class="ba-cerrar"
          aria-label="Cerrar ficha">
          ×
        </button>

      </div>

      <div class="ba-ficha-estado">
        <span class="ba-etiqueta-aprobada">
          Afiliación aprobada
        </span>
      </div>

      <div class="ba-ficha-grid">

        <div class="ba-campo">
          <span>Nombres</span>
          <strong id="ba-ficha-nombres">—</strong>
        </div>

        <div class="ba-campo">
          <span>Apellidos</span>
          <strong id="ba-ficha-apellidos">—</strong>
        </div>

        <div class="ba-campo">
          <span>Correo electrónico</span>
          <strong id="ba-ficha-correo">—</strong>
        </div>

        <div class="ba-campo">
          <span>Institución</span>
          <strong id="ba-ficha-institucion">—</strong>
        </div>

        <div class="ba-campo">
          <span>Fecha de registro de cuenta</span>
          <strong id="ba-ficha-registro">—</strong>
        </div>

        <div class="ba-campo">
          <span>Fecha de solicitud</span>
          <strong id="ba-ficha-solicitud">—</strong>
        </div>

        <div class="ba-campo">
          <span>Fecha de aprobación</span>
          <strong id="ba-ficha-aprobacion">—</strong>
        </div>

        <div class="ba-campo">
          <span>Identificador de afiliación</span>
          <strong id="ba-ficha-id">—</strong>
        </div>

      </div>

      <div class="ba-ficha-nota">

        <strong>Información institucional</strong>

        <p>
          Esta es la ficha básica de vinculación.
          La ficha de atención y los datos sensibles
          requieren su propio proceso de autorización
          y registro institucional.
        </p>

      </div>

      <div class="ba-dialogo-pie">

        <button
          id="ba-cerrar-inferior"
          type="button"
          class="ba-boton">
          Cerrar ficha
        </button>

      </div>

    </div>
  `;

  document.body.append(dialogo);

  $("ba-cerrar").addEventListener(
    "click",
    () => dialogo.close()
  );

  $("ba-cerrar-inferior").addEventListener(
    "click",
    () => dialogo.close()
  );

  function escribirCampo(id, valor) {

    const destino = $(id);

    if (destino) {
      destino.textContent = textoSeguro(valor);
    }
  }

  async function abrirFicha(idAfiliacion) {

    // El backend verifica que la ficha
    // pertenezca a esta institución.
    const ficha = await consultar(
      "/api/instituciones/beneficiarios-afiliados/" +
      encodeURIComponent(idAfiliacion)
    );

    escribirCampo(
      "ba-ficha-nombres",
      ficha.nombres
    );

    escribirCampo(
      "ba-ficha-apellidos",
      ficha.apellidos
    );

    escribirCampo(
      "ba-ficha-correo",
      ficha.correo
    );

    escribirCampo(
      "ba-ficha-institucion",
      ficha.institucion
    );

    escribirCampo(
      "ba-ficha-registro",
      fechaLegible(ficha.fechaRegistroCuenta)
    );

    escribirCampo(
      "ba-ficha-solicitud",
      fechaLegible(ficha.fechaSolicitud)
    );

    escribirCampo(
      "ba-ficha-aprobacion",
      fechaLegible(ficha.fechaAprobacion)
    );

    escribirCampo(
      "ba-ficha-id",
      ficha.idAfiliacion
    );

    dialogo.showModal();
  }

  /* =========================================
     EVENTOS DE ACTUALIZACIÓN
  ========================================= */

  $("ba-actualizar").addEventListener(
    "click",
    () => cargarAfiliados(paginaActual)
  );

  $("ba-anterior").addEventListener(
    "click",
    () => {

      if (paginaActual > 0) {
        cargarAfiliados(paginaActual - 1);
      }
    }
  );

  $("ba-siguiente").addEventListener(
    "click",
    () => {

      if (paginaActual + 1 < paginaTotal) {
        cargarAfiliados(paginaActual + 1);
      }
    }
  );

  // Cuando se vuelve a entrar a Beneficiarios
  // se muestra inicialmente el padrón existente.
  document.addEventListener(
    "click",
    evento => {

      const boton = evento.target.closest(
        '[data-view="beneficiarios"]'
      );

      if (boton) {
        seleccionarPestana("registrados");
      }
    }
  );

  /* =========================================
     INICIALIZACIÓN
  ========================================= */

  seleccionarPestana("registrados");

})();
