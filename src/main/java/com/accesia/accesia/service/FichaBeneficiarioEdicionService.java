
package com.accesia.accesia.service;

import com.accesia.accesia.dto.RegistroFichaBeneficiarioRequest;
import com.accesia.accesia.model.FichaBeneficiario;
import com.accesia.accesia.model.Institucion;
import com.accesia.accesia.repository.FichaBeneficiarioRepository;
import com.accesia.accesia.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;

@Service
public class FichaBeneficiarioEdicionService {

    private final FichaBeneficiarioRepository fichaRepository;
    private final UsuarioRepository usuarioRepository;

    private static final Set<String> DOCUMENTOS = Set.of(
            "DNI",
            "CE",
            "PASAPORTE",
            "CONADIS"
    );

    private static final Set<String> CONDICIONES = Set.of(
            "CEGUERA_TOTAL",
            "BAJA_VISION_SEVERA",
            "BAJA_VISION_MODERADA",
            "VISION_TUBULAR",
            "SORDOCEGUERA",
            "OTRA"
    );

    private static final Set<String> COMUNICACIONES = Set.of(
            "VOZ",
            "TEXTO",
            "AUDIO",
            "BRAILLE",
            "OTRO"
    );

    public FichaBeneficiarioEdicionService(
            FichaBeneficiarioRepository fichaRepository,
            UsuarioRepository usuarioRepository) {

        this.fichaRepository = fichaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /* =========================================
       EDITAR BENEFICIARIO
    ========================================= */

    @Transactional
    public void editar(
            Integer idFicha,
            RegistroFichaBeneficiarioRequest datos,
            String correoInstitucion) {

        if (idFicha == null || idFicha <= 0) {
            throw new IllegalArgumentException(
                    "El identificador de la ficha no es válido."
            );
        }

        if (datos == null) {
            throw new IllegalArgumentException(
                    "Los datos del beneficiario son obligatorios."
            );
        }

        // Identificar la institución autenticada.
        var usuario = usuarioRepository
                .findByEmail(correoInstitucion)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                "Institución no autorizada."
                        )
                );

        if (!(usuario instanceof Institucion institucion)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acceso exclusivo para instituciones."
            );
        }

        if (!"ACTIVO".equalsIgnoreCase(
                institucion.getEstadoUsuario())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La institución no está activa."
            );
        }

        // Buscar solo la ficha perteneciente a la institución.
        FichaBeneficiario ficha = fichaRepository
                .findByIdFichaAndInstitucion(
                        idFicha,
                        institucion
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "La ficha no existe o no pertenece a tu institución."
                        )
                );

        /* =====================================
           VALIDACIÓN DE DATOS
        ===================================== */

        String nombres = obligatorio(
                datos.nombres(), "Nombres", 120
        );

        String apellidos = obligatorio(
                datos.apellidos(), "Apellidos", 120
        );

        String tipoDocumento = obligatorio(
                datos.tipoDocumento(),
                "Tipo de documento",
                20
        ).toUpperCase(Locale.ROOT);

        String numeroDocumento = obligatorio(
                datos.numeroDocumento(),
                "Número de documento",
                20
        );

        String condicionVisual = obligatorio(
                datos.nivelDiscapacidadVisual(),
                "Condición visual",
                60
        );

        if (!DOCUMENTOS.contains(tipoDocumento)) {
            throw new IllegalArgumentException(
                    "El tipo de documento no es válido."
            );
        }

        if ("DNI".equals(tipoDocumento)
                && !numeroDocumento.matches("\\d{8}")) {

            throw new IllegalArgumentException(
                    "El DNI debe contener exactamente 8 dígitos."
            );
        }

        if (!CONDICIONES.contains(condicionVisual)) {
            throw new IllegalArgumentException(
                    "La condición visual seleccionada no es válida."
            );
        }

        LocalDate nacimiento = datos.fechaNacimiento();

        if (nacimiento != null
                && nacimiento.isAfter(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "La fecha de nacimiento no puede ser futura."
            );
        }

        String comunicacion = opcional(
                datos.preferenciaComunicacion(),
                60
        );

        if (comunicacion != null
                && !COMUNICACIONES.contains(comunicacion)) {

            throw new IllegalArgumentException(
                    "La preferencia de comunicación no es válida."
            );
        }

        String email = opcional(
                datos.email(),
                120
        );

        if (email != null) {
            email = email.toLowerCase(Locale.ROOT);

            if (!email.matches(
                    "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
            )) {

                throw new IllegalArgumentException(
                        "El correo electrónico no es válido."
                );
            }
        }

        String sede = opcional(
                datos.sede(),
                120
        );

        String tecnologia = opcional(
                datos.tecnologiaAsistencia(),
                200
        );

        String observaciones = opcional(
                datos.observaciones(),
                1000
        );

        String telefono = opcional(
                datos.telefono(),
                20
        );

        String contactoEmergencia = opcional(
                datos.contactoEmergencia(),
                160
        );

        String telefonoEmergencia = opcional(
                datos.telefonoEmergencia(),
                20
        );

        /* =====================================
           VALIDACIÓN DE DUPLICADOS
        ===================================== */

        boolean duplicado = fichaRepository
                .existsByInstitucionAndTipoDocumentoAndNumeroDocumentoAndIdFichaNot(
                        institucion,
                        tipoDocumento,
                        numeroDocumento,
                        idFicha
                );

        if (duplicado) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Otro beneficiario ya utiliza este documento."
            );
        }

        /* =====================================
           ACTUALIZAR DATOS DE LA FICHA
        ===================================== */

        ficha.setNombres(nombres);
        ficha.setApellidos(apellidos);

        ficha.setTipoDocumento(tipoDocumento);
        ficha.setNumeroDocumento(numeroDocumento);
        ficha.setFechaNacimiento(nacimiento);
        ficha.setSede(sede);

        ficha.setNivelDiscapacidadVisual(condicionVisual);
        ficha.setTecnologiaAsistencia(tecnologia);
        ficha.setPreferenciaComunicacion(comunicacion);

        ficha.setRequiereLectorPantalla(
                Boolean.TRUE.equals(
                        datos.requiereLectorPantalla()
                )
        );

        ficha.setObservaciones(observaciones);

        ficha.setTelefono(telefono);
        ficha.setEmail(email);

        ficha.setContactoEmergencia(contactoEmergencia);
        ficha.setTelefonoEmergencia(telefonoEmergencia);

        // No se modifican:
        // - ID de la ficha.
        // - Institución propietaria.
        // - Estado institucional.
        // - Fecha original de registro.

        fichaRepository.save(ficha);
    }

    /* =========================================
       VALIDACIONES AUXILIARES
    ========================================= */

    private String obligatorio(
            String valor,
            String campo,
            int maximo) {

        String limpio = opcional(valor, maximo);

        if (limpio == null) {
            throw new IllegalArgumentException(
                    "El campo " + campo + " es obligatorio."
            );
        }

        return limpio;
    }

    private String opcional(
            String valor,
            int maximo) {

        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }

        String limpio = valor.trim();

        if (limpio.length() > maximo) {
            throw new IllegalArgumentException(
                    "Un campo supera la longitud máxima de " +
                    maximo + " caracteres."
            );
        }

        return limpio;
    }
}
