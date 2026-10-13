"use strict";

(() => {
  const CLAVE_DATOS = "accesia-datos-demo-v1";
  const CLAVE_PERFIL = "accesia-beneficiario-demo";

  const menu = document.getElementById("menu-modulos");
  const vista = document.getElementById("vista-modulo");
  const titulo = document.getElementById("titulo-panel");
  const descripcion = document.getElementById("descripcion-panel");
  const contenido = document.getElementById("contenido");
  const estado = document.getElementById("estado");

  let perfilId = "";

  try {
    perfilId = sessionStorage.getItem(CLAVE_PERFIL) || "";
  } catch {
    perfilId = "";
  }

  function leerDatos() {
    const datos = {
      beneficiarios: [],
      servicios: [],
      personal: [],
      solicitudes: [],
      asignaciones: [],
      seguimiento: [],
      plan: ""
    };

    try {
      const guardados = JSON.parse(
        localStorage.getItem(CLAVE_DATOS) || "null"
      );

      if (guardados && typeof guardados === "object") {
        for (const clave of Object.keys(datos)) {
          if (clave === "plan") {
            datos.plan =
              typeof guardados.plan === "string"
                ? guardados.plan
                : "";
          } else if (Array.isArray(guardados[clave])) {
            datos[clave] = guardados[clave];
          }
        }
      }
    } catch {
      avisar("No se pudieron recuperar los datos guardados.");
    }

    return datos;
  }

  function guardarDatos(datos) {
    try {
      localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
      return true;
    } catch {
      return false;
    }
  }

  function elegirPerfil(id) {
    perfilId = id;

    try {
      sessionStorage.setItem(CLAVE_PERFIL, id);
    } catch {
      // La selección seguirá disponible mientras esta página esté abierta.
    }
  }

  function elemento(tipo, texto = "", clase = "") {
    const nodo = document.createElement(tipo);
    nodo.textContent = texto;

    if (clase) nodo.className = clase;

    return nodo;
  }

  function boton(texto, accion, clase = "boton-principal") {
    const nodo = elemento("button", texto, clase);
    nodo.type = "button";
    nodo.addEventListener("click", accion);
    return nodo;
  }

  function avisar(texto) {
    estado.textContent = texto;
  }

  function identificar() {
    return window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function campo(labelTexto, entrada, id) {
    const grupo = elemento("div", "", "campo");
    const label = elemento("label", labelTexto);

    entrada.id = id;
    label.htmlFor = id;

    grupo.append(label, entrada);
    return grupo;
  }

  function tarjeta() {
    return elemento("article", "", "demo-registro");
  }

  function perfilActual(datos) {
    return datos.beneficiarios.find(
      (persona) => persona.id === perfilId
    );
  }

  let leyendo = false;

  function detenerLectura() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    leyendo = false;
    document.getElementById("leer-btn").textContent =
      "▶ Leer página";
  }

  function preparar(id, nombre, texto) {
    detenerLectura();

    menu.querySelectorAll("[data-modulo]").forEach((control) => {
      if (control.dataset.modulo === id) {
        control.setAttribute("aria-current", "page");
      } else {
        control.removeAttribute("aria-current");
      }
    });

    titulo.textContent = nombre;
    descripcion.textContent = texto;
    vista.replaceChildren();

    const subtitulo = elemento("h2", nombre);
    subtitulo.id = "titulo-vista";

    vista.append(
      subtitulo,
      elemento(
        "p",
        "Demostración: utiliza datos ficticios. Los datos se guardan en este navegador.",
        "aviso-modulo"
      )
    );
  }

  function mostrarInicio() {
    preparar(
      "inicio",
      "Tu apoyo, más cerca.",
      "Selecciona un perfil ficticio para probar el recorrido."
    );

    const datos = leerDatos();
    const persona = perfilActual(datos);

    vista.append(
      elemento(
        "p",
        persona
          ? `Perfil de demostración seleccionado: ${persona.nombre}.`
          : "Primero selecciona o crea un beneficiario de demostración.",
        "texto-panel"
      )
    );

    const formularioSeleccion = elemento(
      "form",
      "",
      "formulario-login"
    );

    const selector = elemento("select");
    selector.required = true;

    const inicial = elemento("option", "Selecciona un beneficiario");
    inicial.value = "";
    selector.append(inicial);

    for (const beneficiario of datos.beneficiarios) {
      const opcion = elemento("option", beneficiario.nombre);
      opcion.value = beneficiario.id;
      selector.append(opcion);
    }

    selector.value = persona?.id || "";

    const usar = elemento(
      "button",
      "Usar este perfil de demostración",
      "boton-principal"
    );
    usar.type = "submit";

    formularioSeleccion.append(
      campo("Beneficiario de demostración", selector, "perfil-demo"),
      usar
    );

    formularioSeleccion.addEventListener("submit", (evento) => {
      evento.preventDefault();

      if (!formularioSeleccion.reportValidity()) return;

      const actuales = leerDatos();

      if (!actuales.beneficiarios.some(
        (item) => item.id === selector.value
      )) {
        avisar("El perfil seleccionado ya no está disponible.");
        mostrarInicio();
        return;
      }

      elegirPerfil(selector.value);
      mostrarInicio();
      contenido.focus();
      avisar("Perfil de demostración seleccionado.");
    });

    vista.append(formularioSeleccion);

    const nuevo = tarjeta();
    nuevo.append(
      elemento("h3", "Crear un beneficiario ficticio"),
      elemento(
        "p",
        "También puedes crear un perfil para probar las solicitudes."
      )
    );

    const formularioNuevo = elemento(
      "form",
      "",
      "formulario-login"
    );

    const nombre = elemento("input");
    nombre.type = "text";
    nombre.required = true;
    nombre.maxLength = 100;
    nombre.placeholder = "Ejemplo: Persona de prueba";

    const crear = elemento(
      "button",
      "Crear y usar perfil ficticio",
      "boton-principal"
    );
    crear.type = "submit";

    const mensaje = elemento("p", "", "mensaje-login");
    mensaje.setAttribute("role", "status");

    formularioNuevo.append(
      campo("Nombre ficticio", nombre, "nombre-demo"),
      crear,
      mensaje
    );

    nombre.addEventListener("input", () => {
      nombre.setCustomValidity("");
    });

    formularioNuevo.addEventListener("submit", (evento) => {
      evento.preventDefault();
      nombre.setCustomValidity(
        nombre.value.trim() ? "" : "Escribe un nombre ficticio."
      );

      if (!formularioNuevo.reportValidity()) return;

      const actuales = leerDatos();
      const id = identificar();

      actuales.beneficiarios.push({
        id,
        nombre: nombre.value.trim(),
        correo: "",
        necesidad: "Perfil ficticio creado para probar la plataforma."
      });

      if (!guardarDatos(actuales)) {
        mensaje.textContent =
          "No se pudo guardar el perfil. Revisa si el navegador permite almacenamiento local.";
        return;
      }

      elegirPerfil(id);
      mostrarInicio();
      contenido.focus();
      avisar("Perfil ficticio creado y seleccionado.");
    });

    nuevo.append(formularioNuevo);
    vista.append(nuevo);
  }

  function mostrarServicios() {
    preparar(
      "servicios",
      "Servicios disponibles",
      "Encuentra una opción de apoyo."
    );

    const disponibles = leerDatos().servicios.filter(
      (servicio) => servicio.estado === "Disponible"
    );

    if (!disponibles.length) {
      vista.append(
        elemento(
          "p",
          "Todavía no hay servicios disponibles. Agrega uno desde el panel institucional con disponibilidad «Disponible».",
          "texto-panel"
        )
      );
      return;
    }

    for (const servicio of disponibles) {
      const bloque = tarjeta();

      bloque.append(
        elemento("h3", servicio.nombre),
        elemento("p", servicio.descripcion),
        elemento("p", `Horario: ${servicio.horario}`),
        boton("Solicitar este servicio", () => {
          mostrarSolicitar(servicio.id);
          contenido.focus();
        })
      );

      vista.append(bloque);
    }
  }

  function mostrarSolicitar(servicioId = "") {
    preparar(
      "solicitar",
      "Solicitar apoyo",
      "Selecciona un servicio y describe qué necesitas."
    );

    const datos = leerDatos();
    const persona = perfilActual(datos);

    if (!persona) {
      vista.append(
        elemento(
          "p",
          "Primero selecciona un perfil de demostración en Inicio.",
          "texto-panel"
        ),
        boton("Seleccionar perfil", () => {
          mostrarInicio();
          contenido.focus();
        })
      );
      return;
    }

    const disponibles = datos.servicios.filter(
      (servicio) => servicio.estado === "Disponible"
    );

    if (!disponibles.length) {
      vista.append(
        elemento(
          "p",
          "No hay servicios disponibles para solicitar. Agrega un servicio desde el panel institucional.",
          "texto-panel"
        )
      );
      return;
    }

    vista.append(
      elemento(
        "p",
        `Solicitud para: ${persona.nombre}.`,
        "texto-panel"
      )
    );

    const formulario = elemento(
      "form",
      "",
      "formulario-login"
    );

    const selector = elemento("select");
    selector.required = true;

    const inicial = elemento("option", "Selecciona un servicio");
    inicial.value = "";
    selector.append(inicial);

    for (const servicio of disponibles) {
      const opcion = elemento("option", servicio.nombre);
      opcion.value = servicio.id;
      selector.append(opcion);
    }

    selector.value = servicioId;

    const detalle = elemento("textarea");
    detalle.required = true;
    detalle.maxLength = 1000;
    detalle.rows = 5;
    detalle.placeholder =
      "Describe el apoyo que necesitas usando información ficticia.";

    const enviar = elemento(
      "button",
      "Enviar solicitud de demostración",
      "boton-principal"
    );
    enviar.type = "submit";

    const mensaje = elemento("p", "", "mensaje-login");
    mensaje.setAttribute("role", "status");
    mensaje.setAttribute("aria-live", "polite");

    formulario.append(
      campo("Servicio de apoyo", selector, "servicio-solicitud"),
      campo("¿Qué apoyo necesitas?", detalle, "detalle-solicitud"),
      enviar,
      mensaje
    );

    detalle.addEventListener("input", () => {
      detalle.setCustomValidity("");
    });

    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();

      detalle.setCustomValidity(
        detalle.value.trim()
          ? ""
          : "Describe el apoyo que necesitas."
      );

      if (!formulario.reportValidity()) return;

      const actuales = leerDatos();

      const servicio = actuales.servicios.find(
        (item) =>
          item.id === selector.value &&
          item.estado === "Disponible"
      );

      if (!perfilActual(actuales) || !servicio) {
        mensaje.textContent =
          "El perfil o el servicio ya no está disponible. Actualiza esta pantalla.";
        return;
      }

      actuales.solicitudes.push({
        id: identificar(),
        beneficiario: perfilId,
        servicio: selector.value,
        detalle: detalle.value.trim(),
        estado: "Pendiente",
        creada: new Date().toISOString()
      });

      if (!guardarDatos(actuales)) {
        mensaje.textContent =
          "No se pudo guardar la solicitud. Intenta nuevamente.";
        return;
      }

      mostrarSolicitudes();
      contenido.focus();

      const confirmacion = elemento(
        "p",
        "Solicitud enviada en la demostración. Puedes revisarla también desde el panel institucional.",
        "aviso-modulo"
      );

      confirmacion.setAttribute("role", "status");
      vista.append(confirmacion);

      avisar("Solicitud de demostración enviada.");
    });

    vista.append(formulario);
  }

  function mostrarSolicitudes() {
    preparar(
      "solicitudes",
      "Mis solicitudes",
      "Consulta el estado y las novedades de tus solicitudes."
    );

    const datos = leerDatos();
    const persona = perfilActual(datos);

    if (!persona) {
      vista.append(
        elemento(
          "p",
          "Selecciona primero un perfil de demostración en Inicio.",
          "texto-panel"
        )
      );
      return;
    }

    vista.append(
      elemento(
        "p",
        `Perfil de demostración: ${persona.nombre}.`,
        "texto-panel"
      )
    );

    const solicitudes = datos.solicitudes.filter(
      (solicitud) => solicitud.beneficiario === perfilId
    );

    if (!solicitudes.length) {
      vista.append(
        elemento("p", "Todavía no tienes solicitudes.", "texto-panel"),
        boton("Solicitar apoyo", () => {
          mostrarSolicitar();
          contenido.focus();
        })
      );
      return;
    }

    for (const solicitud of [...solicitudes].reverse()) {
      const servicio = datos.servicios.find(
        (item) => item.id === solicitud.servicio
      );

      const bloque = tarjeta();

      bloque.append(
        elemento("h3", servicio?.nombre || "Servicio no disponible"),
        elemento("p", `Estado: ${solicitud.estado}`),
        elemento("p", `Detalle: ${solicitud.detalle}`)
      );

      const asignaciones = datos.asignaciones.filter(
        (item) => item.solicitud === solicitud.id
      );

      for (const asignacion of asignaciones) {
        const responsable = datos.personal.find(
          (item) => item.id === asignacion.personal
        );

        bloque.append(
          elemento(
            "p",
            `Responsable: ${responsable?.nombre || "Sin información"}. Fecha de atención: ${asignacion.fecha}.`
          )
        );
      }

      bloque.append(elemento("h4", "Seguimiento"));

      const novedades = datos.seguimiento.filter(
        (item) => item.solicitud === solicitud.id
      );

      if (!novedades.length) {
        bloque.append(
          elemento("p", "Todavía no hay novedades registradas.")
        );
      } else {
        for (const novedad of novedades) {
          bloque.append(
            elemento("p", `${novedad.fecha}: ${novedad.nota}`)
          );
        }
      }

      vista.append(bloque);
    }
  }

  function mostrarAsistente() {
    preparar(
      "asistente",
      "Asistente IA",
      "Este módulo se conectará en el siguiente paso."
    );

    vista.append(
      elemento(
        "p",
        "El asistente todavía no está conectado a Ollama. Por ahora, puedes consultar servicios y enviar solicitudes.",
        "texto-panel"
      )
    );
  }

  const pantallas = {
    inicio: mostrarInicio,
    servicios: mostrarServicios,
    solicitar: () => mostrarSolicitar(),
    solicitudes: mostrarSolicitudes,
    asistente: mostrarAsistente
  };

  menu.addEventListener("click", (evento) => {
    const control = evento.target.closest("[data-modulo]");
    if (!control) return;

    const pantalla = pantallas[control.dataset.modulo];
    if (!pantalla) return;

    pantalla();
    contenido.focus();
    avisar(titulo.textContent);
  });

  /* Accesibilidad */

  document.getElementById("texto-btn").addEventListener(
    "click",
    (evento) => {
      const activo =
        document.documentElement.classList.toggle("texto-grande");

      evento.currentTarget.setAttribute(
        "aria-pressed",
        String(activo)
      );
    }
  );

  document.getElementById("contraste-btn").addEventListener(
    "click",
    (evento) => {
      const activo =
        document.body.classList.toggle("alto-contraste");

      evento.currentTarget.setAttribute(
        "aria-pressed",
        String(activo)
      );
    }
  );

  const leerBtn = document.getElementById("leer-btn");

  if ("speechSynthesis" in window) {
    leerBtn.addEventListener("click", () => {
      if (leyendo) {
        detenerLectura();
        return;
      }

      window.speechSynthesis.cancel();

      const lectura = new SpeechSynthesisUtterance(
        contenido.innerText
      );

      lectura.lang = "es-PE";
      lectura.rate = 0.95;

      const finalizar = () => {
        leyendo = false;
        leerBtn.textContent = "▶ Leer página";
      };

      lectura.onend = finalizar;
      lectura.onerror = finalizar;

      leyendo = true;
      leerBtn.textContent = "■ Detener lectura";
      window.speechSynthesis.speak(lectura);
    });
  } else {
    leerBtn.disabled = true;
    leerBtn.textContent = "Lectura no disponible";
  }

  window.addEventListener("pagehide", detenerLectura);

  /* Ayuda */

  const dialogo = document.getElementById("dialogo");

  document.getElementById("ayuda-btn").addEventListener(
    "click",
    () => {
      detenerLectura();
      if (!dialogo.open) dialogo.showModal();
    }
  );

  document.getElementById("cerrar-dialogo").addEventListener(
    "click",
    () => dialogo.close()
  );

  mostrarInicio();
})();