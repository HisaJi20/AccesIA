
"use strict";

const $ = (id) => document.getElementById(id);
const root = document.documentElement;

const synth = "speechSynthesis" in window
  ? window.speechSynthesis
  : null;

const SpeechRecognitionAPI =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

let ultimaLectura = "";
let lecturaActual = null;
let reconocimiento = null;
let escuchandoVoz = false;

// MENSAJES ACCESIBLES
function anunciar(mensaje) {
  $("estado-accesible").textContent = "";

  window.requestAnimationFrame(() => {
    $("estado-accesible").textContent = mensaje;
  });
}

// ALMACENAMIENTO DE PREFERENCIAS
function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, String(valor));
  } catch (_) {
    // El almacenamiento es opcional.
  }
}

function leerGuardado(clave, defecto) {
  try {
    return localStorage.getItem(clave) ?? defecto;
  } catch (_) {
    return defecto;
  }
}

// CARGAR PREFERENCIAS VISUALES
const temaGuardado = leerGuardado(
  "accesia-tema",
  "dark"
);

root.dataset.theme =
  temaGuardado === "light" ? "light" : "dark";

let escala = Math.min(
  140,
  Math.max(
    90,
    Number(leerGuardado("accesia-escala", "100")) || 100
  )
);

root.style.fontSize = `${escala}%`;

root.classList.toggle(
  "high-contrast",
  leerGuardado("accesia-contraste", "false") === "true"
);

// ACTUALIZAR CONTROLES
function actualizarControlesVisuales() {
  const alto = root.classList.contains("high-contrast");
  const claro = root.dataset.theme === "light";

  $("contraste").setAttribute(
    "aria-pressed",
    String(alto)
  );

  $("tema").setAttribute(
    "aria-label",
    claro ? "Activar modo oscuro" : "Activar modo claro"
  );

  $("etiqueta-tema").textContent =
    claro ? "Modo oscuro" : "Modo claro";

  $("tema")
    .querySelector("use")
    .setAttribute(
      "href",
      claro ? "#i-moon" : "#i-sun"
    );

  document.querySelector(
    'meta[name="theme-color"]'
  ).content = claro ? "#f5f8fc" : "#0e141b";

  $("disminuir").disabled = escala <= 90;
  $("aumentar").disabled = escala >= 140;
}

actualizarControlesVisuales();

// TAMAÑO DEL TEXTO
$("aumentar").addEventListener("click", () => {
  cambiarEscala(10);
});

$("disminuir").addEventListener("click", () => {
  cambiarEscala(-10);
});

function cambiarEscala(delta) {
  escala = Math.max(
    90,
    Math.min(140, escala + delta)
  );

  root.style.fontSize = `${escala}%`;

  guardar("accesia-escala", escala);

  actualizarControlesVisuales();

  anunciar(`Tamaño de texto: ${escala} por ciento.`);
}

// CONTRASTE
$("contraste").addEventListener("click", () => {
  root.classList.toggle("high-contrast");

  guardar(
    "accesia-contraste",
    root.classList.contains("high-contrast")
  );

  actualizarControlesVisuales();

  anunciar(
    root.classList.contains("high-contrast")
      ? "Alto contraste activado."
      : "Alto contraste desactivado."
  );
});

// MODO CLARO Y OSCURO
$("tema").addEventListener("click", () => {
  root.dataset.theme =
    root.dataset.theme === "dark"
      ? "light"
      : "dark";

  guardar("accesia-tema", root.dataset.theme);

  actualizarControlesVisuales();

  anunciar(
    root.dataset.theme === "light"
      ? "Modo claro activado."
      : "Modo oscuro activado."
  );
});

// CONTENIDO PARA LECTURA POR VOZ
const textoBienvenida = [
  "Bienvenido a AccesIA.",
  "Una plataforma que conecta a instituciones y personas con discapacidad visual con servicios de apoyo accesibles.",
  "¿Cómo deseas ingresar?",
  "Soy una institución: administra beneficiarios, servicios, personal y solicitudes de apoyo.",
  "Soy beneficiario: encuentra servicios accesibles, solicita apoyo y consulta el estado de tus solicitudes.",
  "Puedes utilizar Tab para navegar o seleccionar mediante voz."
].join(" ");

// CONTROLES DE AUDIO
function actualizarAudio(estado) {
  $("etiqueta-pausar").textContent =
    estado === "pausado"
      ? "Reanudar audio"
      : estado === "leyendo"
        ? "Pausar audio"
        : "Pausar / Repetir";

  $("pausar")
    .querySelector("use")
    .setAttribute(
      "href",
      estado === "leyendo"
        ? "#i-pause"
        : "#i-repeat"
    );
}

function detenerAudio() {
  if (synth) {
    synth.cancel();
  }

  lecturaActual = null;
  actualizarAudio("detenido");
}

function reproducir(texto) {
  if (!synth) {
    anunciar(
      "Tu navegador no permite la lectura por voz."
    );
    return;
  }

  if (escuchandoVoz && reconocimiento) {
    reconocimiento.stop();
  }

  detenerAudio();

  ultimaLectura = texto;

  lecturaActual =
    new SpeechSynthesisUtterance(texto);

  lecturaActual.lang = "es-PE";
  lecturaActual.rate = 0.92;

  lecturaActual.onend = () => {
    lecturaActual = null;
    actualizarAudio("detenido");
  };

  lecturaActual.onerror = () => {
    lecturaActual = null;
    actualizarAudio("detenido");
  };

  synth.speak(lecturaActual);
  actualizarAudio("leyendo");
}

if (!synth) {
  $("escuchar").disabled = true;
  $("pausar").disabled = true;
}

// ESCUCHAR LA PÁGINA
$("escuchar").addEventListener("click", () => {
  reproducir(textoBienvenida);
});

// PAUSAR / REANUDAR / REPETIR
$("pausar").addEventListener("click", () => {
  if (!synth) return;

  if (synth.speaking && !synth.paused) {
    synth.pause();
    actualizarAudio("pausado");
    anunciar("Lectura pausada.");
  } else if (synth.paused) {
    synth.resume();
    actualizarAudio("leyendo");
    anunciar("Lectura reanudada.");
  } else {
    reproducir(ultimaLectura || textoBienvenida);
  }
});

// SELECCIÓN MEDIANTE VOZ
const btnVoz = $("seleccionar-voz");

function finalizarVoz() {
  escuchandoVoz = false;

  btnVoz.setAttribute(
    "aria-pressed",
    "false"
  );

  $("etiqueta-voz").textContent =
    "Seleccionar mediante voz";
}

if (SpeechRecognitionAPI) {
  reconocimiento = new SpeechRecognitionAPI();

  reconocimiento.lang = "es-PE";
  reconocimiento.interimResults = false;
  reconocimiento.continuous = false;
  reconocimiento.maxAlternatives = 1;

  reconocimiento.onstart = () => {
    escuchandoVoz = true;

    btnVoz.setAttribute(
      "aria-pressed",
      "true"
    );

    $("etiqueta-voz").textContent =
      "Escuchando… di institución o beneficiario";

    anunciar(
      "Micrófono activado. Di institución o beneficiario."
    );
  };

  reconocimiento.onend = finalizarVoz;

  reconocimiento.onerror = (e) => {
    const mensaje = e.error === "not-allowed"
      ? "Acceso al micrófono denegado. Puedes usar los botones de ingreso."
      : "No se pudo reconocer tu voz. Prueba nuevamente o usa los botones.";

    anunciar(mensaje);
    finalizarVoz();
  };

  reconocimiento.onresult = (event) => {
    const palabra = event.results[0][0]
      .transcript
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (/institucion|institucional/.test(palabra)) {
      anunciar("Acceso institucional seleccionado.");

      window.location.assign(
        $("acceso-institucion").href
      );

    } else if (/beneficiari|persona/.test(palabra)) {
      anunciar("Acceso de beneficiario seleccionado.");

      window.location.assign(
        $("acceso-beneficiario").href
      );

    } else {
      anunciar(
        `Se escuchó: ${palabra}. Di institución o beneficiario.`
      );
    }
  };

  btnVoz.addEventListener("click", () => {
    if (escuchandoVoz) {
      reconocimiento.stop();
      return;
    }

    detenerAudio();

    try {
      reconocimiento.start();
    } catch (_) {
      anunciar(
        "El micrófono ya está ocupado. Vuelve a intentarlo."
      );
    }
  });

} else {
  btnVoz.addEventListener("click", () => {
    abrirDialogo(
      "Selección por voz",
      "El reconocimiento de voz no está disponible en este navegador. Puedes usar Chrome o Edge y autorizar el micrófono, o seleccionar una tarjeta con teclado o ratón."
    );
  });
}

// VENTANAS INFORMATIVAS
const dialogo = $("dialogo");

function abrirDialogo(titulo, mensaje) {
  $("dialogo-titulo").textContent = titulo;
  $("dialogo-mensaje").textContent = mensaje;

  if (!dialogo.open) {
    dialogo.showModal();
  }
}

$("cerrar-dialogo").addEventListener("click", () => {
  dialogo.close();
});

$("aceptar-dialogo").addEventListener("click", () => {
  dialogo.close();
});

// AYUDA DE ACCESIBILIDAD
$("ayuda").addEventListener("click", () => {
  abrirDialogo(
    "Ayuda de accesibilidad",
    "Usa Tab y Mayús + Tab para recorrer los controles. Pulsa Enter para abrir un enlace. Puedes escuchar la página, ajustar el tamaño del texto, alternar entre claro y oscuro o activar alto contraste. El botón de voz permite decir 'institución' o 'beneficiario' en navegadores compatibles."
  );
});

// AVISO DE PRIVACIDAD PROVISIONAL
$("privacidad").addEventListener("click", () => {
  abrirDialogo(
    "Política de privacidad",
    "La política de privacidad oficial de AccesIA está pendiente de publicación. Esta versión es un prototipo de desarrollo: no introduzcas datos personales reales hasta implementar la protección de datos y la política correspondiente."
  );
});

// DETENER AUDIO AL CAMBIAR DE PANTALLA
window.addEventListener("pagehide", () => {
  detenerAudio();

  if (reconocimiento && escuchandoVoz) {
    reconocimiento.abort();
  }
});
