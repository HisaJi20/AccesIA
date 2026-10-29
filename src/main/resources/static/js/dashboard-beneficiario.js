
"use strict";

/* =========================================
   ACCESIA - DASHBOARD DEL BENEFICIARIO
   CUENTA REAL + MYSQL + ASISTENTE IA
========================================= */

(() => {

  /* =====================================
     1. ELEMENTOS PRINCIPALES
  ===================================== */

  const menu = document.getElementById("menu-modulos");
  const sidebar = document.getElementById("sidebar");
  const menuMovil = document.getElementById("menu-movil");

  const alerta = document.getElementById("alerta-panel");
  const estado = document.getElementById("estado-accesible");

  const textoBtn = document.getElementById("texto-btn");
  const contrasteBtn = document.getElementById("contraste-btn");
  const temaBtn = document.getElementById("tema-btn");
  const leerBtn = document.getElementById("leer-btn");
  const salirBtn = document.getElementById("salir-btn");

  const perfilForm = document.getElementById("perfil-form");
  const perfilGuardar = document.getElementById("perfil-guardar");
  const perfilMensaje = document.getElementById("perfil-mensaje");

  const chatForm = document.getElementById("chat-form");
  const chatConsulta = document.getElementById("chat-consulta");
  const chatEnviar = document.getElementById("chat-enviar");
  const chatEstado = document.getElementById("chat-estado");
  const chatHistorial = document.getElementById("chat-historial");

  let perfilActual = null;
  let vistaActual = "inicio";
  let leyendo = false;
  let enviandoChat = false;

  // No permitir guardar antes de recuperar el perfil.
  perfilGuardar.disabled = true;

  /* =====================================
     2. FUNCIONES AUXILIARES
  ===================================== */

  function elemento(id) {
    return document.getElementById(id);
  }

  function texto(valor) {
    if (
      valor === null ||
      valor === undefined ||
      String(valor).trim() === ""
    ) {
      return "No registrado";
    }

    return String(valor);
  }

  function anunciar(mensaje) {
    estado.textContent = mensaje;
  }

  function mostrarAlerta(mensaje) {
    alerta.textContent = mensaje;
    alerta.hidden = false;
    anunciar(mensaje);
  }

  function limpiarAlerta() {
    alerta.textContent = "";
    alerta.hidden = true;
  }

  function nombreCompleto(perfil) {
    return [
      perfil.nombres,
      perfil.apellidos
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  function fechaCorta(valor) {
    if (!valor) {
      return "No registrada";
    }

    const partes = String(valor)
      .slice(0, 10)
      .split("-");

    return partes.length === 3
      ? `${partes[2]}/${partes[1]}/${partes[0]}`
      : String(valor);
  }

  function nombreCondicion(valor) {
    const condiciones = {
      CEGUERA_TOTAL: "Ceguera total",
      BAJA_VISION_SEVERA: "Baja visión severa",
      BAJA_VISION_MODERADA: "Baja visión moderada",
      VISION_TUBULAR: "Visión tubular",
      SORDOCEGUERA: "Sordoceguera",
      OTRA: "Otra"
    };

    return condiciones[valor] || texto(valor);
  }

  async function leerJson(respuesta) {
    const tipo = respuesta.headers.get("content-type") || "";

    if (!tipo.includes("application/json")) {
      throw new Error(
        "El servidor no devolvió una respuesta JSON válida."
      );
    }

    return respuesta.json();
  }

  /* =====================================
     3. NAVEGACIÓN
  ===================================== */

  function abrirVista(nombre, enfocar = true) {

    const destino = elemento("panel-" + nombre);

    if (!destino) {
      return;
    }

    vistaActual = nombre;

    document.querySelectorAll(".panel-section")
      .forEach(seccion => {

        seccion.hidden = seccion !== destino;
      });

    menu.querySelectorAll("[data-view]")
      .forEach(boton => {

        const activo = boton.dataset.view === nombre;

        boton.classList.toggle("activo", activo);

        if (activo) {
          boton.setAttribute("aria-current", "page");
        } else {
          boton.removeAttribute("aria-current");
        }
      });

    sidebar.classList.remove("abierto");

    menuMovil.setAttribute(
      "aria-expanded",
      "false"
    );

    detenerLectura();

    if (enfocar) {
      elemento("contenido").focus();
    }

    const titulo = destino.querySelector("h1");

    anunciar(
      titulo ? titulo.textContent.trim() : "Sección abierta."
    );
  }

  menu.addEventListener("click", evento => {

    const boton = evento.target.closest(
      "[data-view]"
    );

    if (boton) {
      abrirVista(boton.dataset.view);
    }
  });

  document.addEventListener("click", evento => {

    const boton = evento.target.closest(
      "[data-ir]"
    );

    if (boton) {
      abrirVista(boton.dataset.ir);
    }
  });

  menuMovil.addEventListener("click", () => {

    const abierto = sidebar.classList.toggle("abierto");

    menuMovil.setAttribute(
      "aria-expanded",
      String(abierto)
    );
  });

  document.addEventListener("keydown", evento => {

    if (evento.key === "Escape") {
      sidebar.classList.remove("abierto");

      menuMovil.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  });

  /* =====================================
     4. MOSTRAR PERFIL EN LA INTERFAZ
  ===================================== */

  function mostrarPerfil(perfil) {

    perfilActual = perfil;

    const nombre = nombreCompleto(perfil);

    elemento("sidebar-nombre").textContent =
      nombre || "Beneficiario";

    elemento("sidebar-correo").textContent =
      texto(perfil.email);

    elemento("sidebar-avatar").textContent =
      (perfil.nombres || "B").charAt(0).toUpperCase();

    elemento("saludo-beneficiario").textContent =
      `Bienvenido, ${perfil.nombres || "beneficiario"}. ` +
      "Este es tu espacio personal de AccesIA.";

    elemento("resumen-nombre").textContent =
      nombre || "Beneficiario";

    elemento("resumen-correo").textContent =
      texto(perfil.email);

    elemento("resumen-estado").textContent =
      perfil.estadoUsuario === "ACTIVO"
        ? "Cuenta activa"
        : "Estado de cuenta: " +
          texto(perfil.estadoUsuario);

    /* DATOS DEL PERFIL */

    elemento("dato-nombres").textContent =
      texto(perfil.nombres);

    elemento("dato-apellidos").textContent =
      texto(perfil.apellidos);

    elemento("dato-correo").textContent =
      texto(perfil.email);

    elemento("dato-documento").textContent =
      perfil.numeroDocumento
        ? [
            perfil.tipoDocumento,
            perfil.numeroDocumento
          ].filter(Boolean).join(" ")
        : "No registrado";

    elemento("dato-nacimiento").textContent =
      fechaCorta(perfil.fechaNacimiento);

    elemento("dato-visual").textContent =
      nombreCondicion(
        perfil.nivelDiscapacidadVisual
      );

    /* PREFERENCIAS EDITABLES */

    elemento("perfil-telefono").value =
      perfil.telefono || "";

    elemento("perfil-comunicacion").value =
      perfil.preferenciaComunicacion || "";

    elemento("perfil-lector").checked =
      perfil.requiereLectorPantalla === true;

    perfilGuardar.disabled = false;
  }

  /* =====================================
     5. CONSULTAR PERFIL EN MYSQL
  ===================================== */

  async function cargarMiPerfil() {

    limpiarAlerta();

    try {

      const respuesta = await fetch(
        "/api/beneficiarios/mi-perfil",
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
          "Tu sesión no es válida. " +
          "Inicia sesión como beneficiario."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          "No se pudo recuperar el perfil. HTTP " +
          respuesta.status
        );
      }

      const perfil = await leerJson(respuesta);

      if (!perfil.idUsuario) {
        throw new Error(
          "No se pudo identificar la cuenta personal."
        );
      }

      mostrarPerfil(perfil);

      anunciar(
        "Perfil personal cargado correctamente."
      );

    } catch (error) {

      mostrarAlerta(
        "No fue posible cargar tu cuenta: " +
        error.message +
        " Puedes regresar al acceso de beneficiarios."
      );

      perfilGuardar.disabled = true;
    }
  }

  /* =====================================
     6. TOKEN CSRF
  ===================================== */

  async function obtenerCsrf() {

    const respuesta = await fetch(
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

    if (!respuesta.ok || respuesta.redirected) {
      throw new Error(
        "No se pudo obtener el token de seguridad."
      );
    }

    const csrf = await leerJson(respuesta);

    if (!csrf.headerName || !csrf.token) {
      throw new Error(
        "El token CSRF recibido no es válido."
      );
    }

    return csrf;
  }

  /* =====================================
     7. ACTUALIZAR PERFIL
  ===================================== */

  perfilForm.addEventListener("submit", async evento => {

    evento.preventDefault();

    if (!perfilActual || !perfilForm.reportValidity()) {
      return;
    }

    perfilGuardar.disabled = true;
    perfilGuardar.textContent = "Guardando...";

    perfilMensaje.textContent =
      "Actualizando tus preferencias...";
    perfilMensaje.dataset.error = "false";

    try {

      const csrf = await obtenerCsrf();

      const datos = {

        telefono:
          elemento("perfil-telefono").value.trim() || null,

        preferenciaComunicacion:
          elemento("perfil-comunicacion").value.trim() || null,

        requiereLectorPantalla:
          elemento("perfil-lector").checked
      };

      const respuesta = await fetch(
        "/api/beneficiarios/mi-perfil",
        {
          method: "PUT",
          credentials: "same-origin",

          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            [csrf.headerName]: csrf.token
          },

          body: JSON.stringify(datos)
        }
      );

      if (respuesta.redirected) {
        throw new Error(
          "La sesión ha expirado."
        );
      }

      const resultado = await leerJson(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje ||
          "No se pudieron actualizar tus datos."
        );
      }

      mostrarPerfil(resultado);

      perfilMensaje.textContent =
        "¡Tus preferencias se guardaron correctamente!";

      anunciar(perfilMensaje.textContent);

    } catch (error) {

      perfilMensaje.dataset.error = "true";

      perfilMensaje.textContent =
        "No se pudo guardar: " + error.message;

      anunciar(perfilMensaje.textContent);

    } finally {

      perfilGuardar.disabled = perfilActual === null;

      perfilGuardar.textContent =
        "Guardar cambios";
    }
  });

  /* =====================================
     8. MODO CLARO Y OSCURO
  ===================================== */

  function aplicarTema(tema) {

    const oscuro = tema === "dark";

    document.documentElement.dataset.theme =
      oscuro ? "dark" : "light";

    temaBtn.innerHTML = oscuro
      ? "☀ <span>Modo claro</span>"
      : "◑ <span>Modo oscuro</span>";

    temaBtn.setAttribute(
      "aria-pressed",
      String(oscuro)
    );
  }

  let temaInicial = "light";

  try {

    const guardado = localStorage.getItem(
      "accesia-theme"
    );

    if (guardado === "dark" || guardado === "light") {
      temaInicial = guardado;
    }

  } catch (error) {
    // Conservar tema predeterminado.
  }

  aplicarTema(temaInicial);

  temaBtn.addEventListener("click", () => {

    const siguiente =
      document.documentElement.dataset.theme === "dark"
        ? "light"
        : "dark";

    aplicarTema(siguiente);

    try {

      localStorage.setItem(
        "accesia-theme",
        siguiente
      );

    } catch (error) {
      // El tema sigue funcionando en esta página.
    }
  });

  /* =====================================
     9. TAMAÑO DE TEXTO Y CONTRASTE
  ===================================== */

  textoBtn.addEventListener("click", () => {

    const activo =
      document.documentElement.classList.toggle(
        "texto-grande"
      );

    textoBtn.setAttribute(
      "aria-pressed",
      String(activo)
    );
  });

  contrasteBtn.addEventListener("click", () => {

    const activo = document.body.classList.toggle(
      "alto-contraste"
    );

    contrasteBtn.setAttribute(
      "aria-pressed",
      String(activo)
    );
  });

  /* =====================================
     10. LECTURA DE LA PÁGINA
  ===================================== */

  function detenerLectura() {

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    leyendo = false;

    leerBtn.innerHTML =
      "▶ <span>Leer página</span>";
  }

  if ("speechSynthesis" in window) {

    leerBtn.addEventListener("click", () => {

      if (leyendo) {
        detenerLectura();
        return;
      }

      const seccion = elemento(
        "panel-" + vistaActual
      );

      if (!seccion) {
        return;
      }

      const lectura =
        new SpeechSynthesisUtterance(
          seccion.innerText
        );

      lectura.lang = "es-PE";
      lectura.rate = 0.95;

      lectura.onend = detenerLectura;
      lectura.onerror = detenerLectura;

      window.speechSynthesis.cancel();

      leyendo = true;

      leerBtn.innerHTML =
        "■ <span>Detener lectura</span>";

      window.speechSynthesis.speak(lectura);
    });

    window.addEventListener(
      "pagehide",
      detenerLectura
    );

  } else {

    leerBtn.disabled = true;

    leerBtn.textContent =
      "Lectura no disponible";
  }

  /* =====================================
     11. ASISTENTE IA
  ===================================== */

  function agregarMensaje(autor, contenido, usuario = false) {

    const bloque = document.createElement("div");

    bloque.className = usuario
      ? "chat-mensaje chat-usuario"
      : "chat-mensaje chat-ia";

    const nombre = document.createElement("strong");
    nombre.textContent = autor;

    const parrafo = document.createElement("p");
    parrafo.textContent = contenido;

    bloque.append(nombre, parrafo);

    chatHistorial.appendChild(bloque);

    chatHistorial.scrollTop =
      chatHistorial.scrollHeight;
  }

  chatForm.addEventListener("submit", async evento => {

    evento.preventDefault();

    if (enviandoChat) {
      return;
    }

    const consulta = chatConsulta.value.trim();

    chatConsulta.setCustomValidity(
      consulta ? "" : "Escribe tu consulta."
    );

    if (!chatForm.reportValidity()) {
      return;
    }

    agregarMensaje("Tú", consulta, true);

    enviandoChat = true;
    chatEnviar.disabled = true;
    chatEnviar.textContent = "Consultando...";

    chatConsulta.readOnly = true;
    chatEstado.textContent =
      "El asistente está preparando una respuesta.";

    const controlador = new AbortController();

    const tiempoMaximo = setTimeout(
      () => controlador.abort(),
      130000
    );

    try {

      const csrf = await obtenerCsrf();

      const respuesta = await fetch(
        "/api/asistente",
        {
          method: "POST",
          credentials: "same-origin",

          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            [csrf.headerName]: csrf.token
          },

          body: JSON.stringify({
            mensaje: consulta
          }),

          signal: controlador.signal
        }
      );

      if (respuesta.redirected) {
        throw new Error(
          "La sesión ha expirado."
        );
      }

      if (respuesta.status === 403) {
        throw new Error(
          "Acceso rechazado. Revisa la sesión o el token CSRF."
        );
      }

      const datos = await leerJson(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          datos.respuesta ||
          datos.mensaje ||
          "No se pudo consultar al asistente."
        );
      }

      if (
        typeof datos.respuesta !== "string" ||
        !datos.respuesta.trim()
      ) {
        throw new Error(
          "El asistente devolvió una respuesta vacía."
        );
      }

      agregarMensaje(
        "Asistente AccesIA",
        datos.respuesta.trim()
      );

      chatConsulta.value = "";
      chatEstado.textContent = "";

    } catch (error) {

      chatEstado.textContent =
        error.name === "AbortError"
          ? "La consulta tardó demasiado. Intenta nuevamente."
          : "No se completó la consulta: " +
            error.message;

      anunciar(chatEstado.textContent);

    } finally {

      clearTimeout(tiempoMaximo);

      enviandoChat = false;
      chatEnviar.disabled = false;

      chatEnviar.textContent =
        "Enviar consulta";

      chatConsulta.readOnly = false;

      if (chatForm.isConnected) {
        chatConsulta.focus();
      }
    }
  });

  chatConsulta.addEventListener("input", () => {
    chatConsulta.setCustomValidity("");
  });

  /* =====================================
     12. CERRAR SESIÓN REAL
  ===================================== */

  salirBtn.addEventListener("click", async () => {

    salirBtn.disabled = true;
    salirBtn.textContent = "Cerrando sesión...";

    try {

      const csrf = await obtenerCsrf();

      // Spring Security procesa POST /logout.
      const respuesta = await fetch(
        "/logout",
        {
          method: "POST",
          credentials: "same-origin",

          headers: {
            [csrf.headerName]: csrf.token
          }
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          "El servidor no pudo cerrar la sesión."
        );
      }

      // No basta con ir al inicio:
      // primero se invalida la sesión del servidor.
      window.location.replace(
        "/login-beneficiario.html"
      );

    } catch (error) {

      mostrarAlerta(
        "No se pudo cerrar la sesión: " +
        error.message
      );

      salirBtn.disabled = false;

      salirBtn.innerHTML =
        '<span class="nav-icono" aria-hidden="true">↪</span>' +
        'Cerrar sesión';
    }
  });

  /* =====================================
     13. INICIAR EL PANEL
  ===================================== */

  abrirVista("inicio", false);

  cargarMiPerfil();

})();
