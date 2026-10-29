
"use strict";

/* =========================================
   ACCESIA - REGISTRO DEL BENEFICIARIO
   SPRING BOOT + MYSQL + CSRF
========================================= */

/* =========================================
   1. ELEMENTOS DEL FORMULARIO
========================================= */

const formulario = document.getElementById("registro-form");

const nombres = document.getElementById("nombres");
const apellidos = document.getElementById("apellidos");
const correo = document.getElementById("correo");
const telefono = document.getElementById("telefono");

const clave = document.getElementById("clave");
const confirmarClave = document.getElementById(
  "confirmar-clave"
);

const mensaje = document.getElementById(
  "mensaje-registro"
);

const textoBtn = document.getElementById("texto-btn");
const contrasteBtn = document.getElementById(
  "contraste-btn"
);

const leerBtn = document.getElementById("leer-btn");

const botonRegistrar = formulario.querySelector(
  'button[type="submit"]'
);

/* =========================================
   2. AUMENTAR TAMAÑO DE TEXTO
========================================= */

textoBtn.addEventListener("click", () => {

  const activo = document.documentElement.classList.toggle(
    "texto-grande"
  );

  textoBtn.setAttribute(
    "aria-pressed",
    String(activo)
  );
});

/* =========================================
   3. ALTO CONTRASTE
========================================= */

contrasteBtn.addEventListener("click", () => {

  const activo = document.body.classList.toggle(
    "alto-contraste"
  );

  contrasteBtn.setAttribute(
    "aria-pressed",
    String(activo)
  );
});

/* =========================================
   4. MOSTRAR Y OCULTAR CONTRASEÑAS
========================================= */

document.querySelectorAll("[data-mostrar]").forEach(
  boton => {

    boton.addEventListener("click", () => {

      const entrada = document.getElementById(
        boton.dataset.mostrar
      );

      if (!entrada) return;

      const mostrar = entrada.type === "password";

      entrada.type = mostrar ? "text" : "password";

      boton.textContent = mostrar
        ? "Ocultar"
        : "Mostrar";

      boton.setAttribute(
        "aria-pressed",
        String(mostrar)
      );
    });
  }
);

/* =========================================
   5. VALIDAR CONTRASEÑAS
========================================= */

// Mantener la misma regla del backend.
clave.minLength = 10;
confirmarClave.minLength = 10;

function validarCoincidencia() {

  confirmarClave.setCustomValidity("");

  if (
    confirmarClave.value &&
    confirmarClave.value !== clave.value
  ) {
    confirmarClave.setCustomValidity(
      "Las contraseñas deben coincidir."
    );
  }
}

clave.addEventListener(
  "input",
  validarCoincidencia
);

confirmarClave.addEventListener(
  "input",
  validarCoincidencia
);

/* =========================================
   6. VALIDACIONES ADICIONALES
========================================= */

// Coincidir con las longitudes máximas del servidor.
correo.maxLength = 120;
telefono.maxLength = 20;

function validarFormulario() {

  validarCoincidencia();

  nombres.value = nombres.value.trim();
  apellidos.value = apellidos.value.trim();

  correo.value = correo.value
    .trim()
    .toLowerCase();

  telefono.value = telefono.value.trim();

  if (!formulario.reportValidity()) {
    return false;
  }

  if (!nombres.value || !apellidos.value) {
    mensaje.textContent =
      "Debes ingresar tus nombres y apellidos.";

    return false;
  }

  if (clave.value.length < 10) {
    mensaje.textContent =
      "La contraseña debe tener al menos 10 caracteres.";

    return false;
  }

  // BCrypt admite hasta 72 bytes de contraseña.
  const longitudBytes = new TextEncoder().encode(
    clave.value
  ).length;

  if (longitudBytes > 72) {
    mensaje.textContent =
      "La contraseña es demasiado larga. " +
      "Utiliza una de hasta 72 bytes.";

    return false;
  }

  return true;
}

/* =========================================
   7. MENSAJES ACCESIBLES
========================================= */

function mostrarMensaje(texto, esError = false) {

  mensaje.textContent = texto;

  mensaje.setAttribute(
    "role",
    esError ? "alert" : "status"
  );

  mensaje.setAttribute(
    "aria-live",
    esError ? "assertive" : "polite"
  );

  mensaje.style.color = esError
    ? "var(--error, #e85d65)"
    : "";

}

formulario.addEventListener("input", () => {
  mensaje.textContent = "";
});

/* =========================================
   8. REGISTRO REAL EN MYSQL
========================================= */

formulario.addEventListener(
  "submit",
  async (evento) => {

    evento.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    botonRegistrar.disabled = true;
    botonRegistrar.textContent =
      "Registrando cuenta...";

    mostrarMensaje(
      "Estamos registrando tu cuenta en AccesIA."
    );

    // Datos que acepta nuestro DTO de Spring Boot.
    const datos = {

      nombres: nombres.value,
      apellidos: apellidos.value,

      email: correo.value,

      clave: clave.value,

      telefono: telefono.value || null,

      // El resto del perfil se completará después.
      tipoDocumento: null,
      numeroDocumento: null,
      fechaNacimiento: null,

      nivelDiscapacidadVisual: null,
      preferenciaComunicacion: null,
      requiereLectorPantalla: false
    };

    try {

      /* =================================
         8.1 OBTENER TOKEN CSRF
      ================================= */

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

      /* =================================
         8.2 REGISTRAR CUENTA
      ================================= */

      const respuesta = await fetch(
        "/api/beneficiarios/registro",
        {
          method: "POST",
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
          "El servidor redirigió la solicitud. " +
          "Comprueba que la ruta de registro sea pública."
        );
      }

      const resultado = await respuesta.json()
        .catch(() => ({}));

      /* =================================
         8.3 VALIDAR RESPUESTA
      ================================= */

      if (respuesta.status === 404) {
        throw new Error(
          "La API de registro del beneficiario " +
          "no está disponible en Spring Boot."
        );
      }

      if (respuesta.status === 403) {
        throw new Error(
          "La solicitud fue rechazada por seguridad. " +
          "Comprueba el token CSRF y los permisos."
        );
      }

      if (respuesta.status === 409) {
        throw new Error(
          resultado.mensaje ||
          "El correo electrónico ya está registrado."
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje ||
          "No se pudo registrar la cuenta. HTTP " +
          respuesta.status
        );
      }

      /* =================================
         8.4 REGISTRO EXITOSO
      ================================= */

      const codigo = resultado.idUsuario;

      mostrarMensaje(
        "¡Tu cuenta fue registrada correctamente!" +
        (codigo ? " Código: " + codigo + "." : "") +
        " Ya puedes iniciar sesión como beneficiario."
      );

      // Limpiar datos después de guardar.
      formulario.reset();

      // Restaurar campos de contraseña.
      clave.type = "password";
      confirmarClave.type = "password";

      document.querySelectorAll(
        "[data-mostrar]"
      ).forEach(boton => {

        boton.textContent = "Mostrar";

        boton.setAttribute(
          "aria-pressed",
          "false"
        );
      });

      // No iniciar sesión automáticamente.
      // La autenticación personal se configurará
      // en la siguiente etapa.

    } catch (error) {

      mostrarMensaje(
        "No se pudo registrar la cuenta: " +
        error.message,
        true
      );

    } finally {

      botonRegistrar.disabled = false;
      botonRegistrar.textContent =
      "Crear mi cuenta →";
    }
  }
);

/* =========================================
   9. LECTURA DE VOZ
========================================= */

if ("speechSynthesis" in window && leerBtn) {

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

    const titulo = document.getElementById(
      "titulo-registro"
    )?.textContent || "Registro de beneficiario";

    const etiquetas = Array.from(
      formulario.querySelectorAll("label")
    )
      .map(etiqueta => etiqueta.textContent.trim())
      .join(". ");

    // No se leen contraseñas ni datos ingresados.
    const lectura = new SpeechSynthesisUtterance(
      "AccesIA. " + titulo + ". " +
      "Completa los siguientes campos: " +
      etiquetas + ". " +
      "La contraseña debe tener al menos " +
      "10 caracteres. " +
      "Ambas contraseñas deben coincidir. " +
      "Usa la tecla Tab para recorrer los campos. " +
      "Cuando termines, selecciona Registrar beneficiario."
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
