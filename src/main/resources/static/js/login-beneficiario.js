
"use strict";

/* =========================================
   ACCESIA - LOGIN REAL DEL BENEFICIARIO
   MYSQL + SPRING SECURITY + CSRF
========================================= */

(() => {

  /* =====================================
     1. ELEMENTOS
  ===================================== */

  const formulario = document.getElementById(
    "login-beneficiario-form"
  );

  const correo = document.getElementById(
    "correo-beneficiario"
  );

  const clave = document.getElementById(
    "clave-beneficiario"
  );

  const mensaje = document.getElementById(
    "mensaje-login-beneficiario"
  );

  const botonIngresar = document.getElementById(
    "boton-ingresar"
  );

  const mostrarClave = document.getElementById(
    "mostrar-clave"
  );

  const textoBtn = document.getElementById(
    "texto-btn"
  );

  const contrasteBtn = document.getElementById(
    "contraste-btn"
  );

  const leerBtn = document.getElementById(
    "leer-btn"
  );

  /* =====================================
     2. MENSAJES ACCESIBLES
  ===================================== */

  function mostrarMensaje(texto, error = false) {

    mensaje.textContent = texto;

    mensaje.setAttribute(
      "role",
      error ? "alert" : "status"
    );

    mensaje.setAttribute(
      "aria-live",
      error ? "assertive" : "polite"
    );

    mensaje.dataset.estado =
      error ? "error" : "informacion";
  }

  /* =====================================
     3. TAMAÑO DE TEXTO
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

  /* =====================================
     4. ALTO CONTRASTE
  ===================================== */

  contrasteBtn.addEventListener("click", () => {

    const activo =
      document.body.classList.toggle(
        "alto-contraste"
      );

    contrasteBtn.setAttribute(
      "aria-pressed",
      String(activo)
    );
  });

  /* =====================================
     5. MOSTRAR CONTRASEÑA
  ===================================== */

  mostrarClave.addEventListener("click", () => {

    const visible = clave.type === "password";

    clave.type = visible
      ? "text"
      : "password";

    mostrarClave.textContent = visible
      ? "Ocultar"
      : "Mostrar";

    mostrarClave.setAttribute(
      "aria-pressed",
      String(visible)
    );
  });

  /* =====================================
     6. BORRAR MENSAJE AL CORREGIR
  ===================================== */

  formulario.addEventListener("input", () => {
    mensaje.textContent = "";
  });

  /* =====================================
     7. INICIAR SESIÓN
  ===================================== */

  formulario.addEventListener(
    "submit",
    async (evento) => {

      evento.preventDefault();

      correo.value = correo.value
        .trim()
        .toLowerCase();

      if (!formulario.reportValidity()) {
        return;
      }

      botonIngresar.disabled = true;

      botonIngresar.textContent =
        "Verificando acceso...";

      mostrarMensaje(
        "Estamos verificando tus credenciales."
      );

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
            "El token de seguridad recibido no es válido."
          );
        }

        /* DATOS DEL LOGIN */

        const datos = new URLSearchParams();

        datos.set("correo", correo.value);
        datos.set("clave", clave.value);

        /* AUTENTICAR EN SPRING SECURITY */

        const respuesta = await fetch(
          "/api/auth/login",
          {
            method: "POST",
            credentials: "same-origin",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded;charset=UTF-8",

              "Accept": "application/json",

              [csrf.headerName]: csrf.token
            },

            body: datos.toString()
          }
        );

        if (respuesta.redirected) {
          throw new Error(
            "El servidor redirigió la autenticación."
          );
        }

        const resultado = await respuesta.json()
          .catch(() => ({}));

        if (respuesta.status === 401) {
          throw new Error(
            resultado.mensaje ||
            "Correo o contraseña incorrectos."
          );
        }

        if (respuesta.status === 403) {
          throw new Error(
            "Acceso rechazado. Comprueba el token CSRF."
          );
        }

        if (!respuesta.ok) {
          throw new Error(
            resultado.mensaje ||
            "No se pudo iniciar sesión. HTTP " +
            respuesta.status
          );
        }

        /* VERIFICAR EL ROL */

        if (resultado.rol !== "BENEFICIARIO") {

          if (resultado.rol === "INSTITUCION") {
            throw new Error(
              "Esta cuenta pertenece a una institución. " +
              "Utiliza el acceso institucional."
            );
          }

          throw new Error(
            "La cuenta no tiene permisos de beneficiario."
          );
        }

        if (
          resultado.destino !==
          "/panel-beneficiario.html"
        ) {
          throw new Error(
            "El servidor devolvió un destino no válido."
          );
        }

        /* LOGIN CORRECTO */

        mostrarMensaje(
          "Inicio de sesión correcto. " +
          "Ingresando a tu panel personal."
        );

        // La sesión es administrada por Spring Security.
        // No guardar contraseñas ni tokens de sesión
        // en localStorage.

        clave.value = "";

        window.location.assign(
          "/panel-beneficiario.html"
        );

      } catch (error) {

        mostrarMensaje(
          error.message ||
          "No se pudo iniciar sesión.",
          true
        );

      } finally {

        botonIngresar.disabled = false;

        botonIngresar.textContent =
          "Ingresar a mi cuenta →";
      }
    }
  );

  /* =====================================
     8. LECTURA DE PÁGINA
  ===================================== */

  if (
    "speechSynthesis" in window &&
    leerBtn
  ) {

    let leyendo = false;

    function finalizarLectura() {

      leyendo = false;

      leerBtn.textContent =
        "▶ Leer página";
    }

    leerBtn.addEventListener("click", () => {

      if (leyendo) {

        window.speechSynthesis.cancel();

        finalizarLectura();

        return;
      }

      const lectura =
        new SpeechSynthesisUtterance(
          "AccesIA. Acceso para beneficiarios. " +
          "Ingresa tu correo electrónico " +
          "y contraseña. " +
          "Selecciona Ingresar a mi cuenta. " +
          "Si todavía no tienes una cuenta, " +
          "selecciona Crear cuenta. " +
          "Puedes utilizar Tab para recorrer " +
          "los controles. " +
          "También están disponibles las opciones " +
          "de tamaño de texto, contraste " +
          "y modo claro u oscuro."
        );

      lectura.lang = "es-PE";
      lectura.rate = 0.95;

      lectura.onend = finalizarLectura;
      lectura.onerror = finalizarLectura;

      window.speechSynthesis.cancel();

      leyendo = true;

      leerBtn.textContent =
        "■ Detener lectura";

      window.speechSynthesis.speak(lectura);
    });

    window.addEventListener("pagehide", () => {
      window.speechSynthesis.cancel();
    });

  } else if (leerBtn) {

    leerBtn.disabled = true;

    leerBtn.textContent =
      "Lectura no disponible";
  }

})();
