
package com.accesia.accesia.service;

import com.accesia.accesia.dto.RegistroFichaBeneficiarioRequest;
import com.accesia.accesia.model.FichaBeneficiario;
import com.accesia.accesia.model.Institucion;
import com.accesia.accesia.repository.FichaBeneficiarioRepository;
import com.accesia.accesia.repository.UsuarioRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;

@Service
public class FichaBeneficiarioService {

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

    public FichaBeneficiarioService(
            FichaBeneficiarioRepository fichaRepository,
            UsuarioRepository usuarioRepository) {

        this.fichaRepository = fichaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /* ========================================
       1. REGISTRAR BENEFICIARIO
    ======================================== */

    @Transactional
    public Integer registrar(
            RegistroFichaBeneficiarioRequest datos,
            String correoInstitucion) {

        if (datos == null) {
            throw new IllegalArgumentException(
                    "Los datos del beneficiario son obligatorios."
            );
        }

        // Identificar la institución autenticada.
        var usuario = usuarioRepository
                .findByEmail(correoInstitucion)
                .orElseThrow(() -> new AccessDeniedException(
                        "Institución no autorizada."
                ));

        if (!(usuario instanceof Institucion institucion)) {
            throw new AccessDeniedException(
                    "La cuenta no pertenece a una institución."
            );
        }

        if (!"ACTIVO".equalsIgnoreCase(
                institucion.getEstadoUsuario())) {

            throw new AccessDeniedException(
                    "La institución no está activa."
            );
        }

        // Validar datos personales.
        String nombres = obligatorio(
                datos.nombres(),
                "Nombres",
                120
        );

        String apellidos = obligatorio(
                datos.apellidos(),
                "Apellidos",
                120
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
                    "Selecciona una condición visual válida."
            );
        }

        LocalDate nacimiento = datos.fechaNacimiento();

        if (nacimiento != null
                && nacimiento.isAfter(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "La fecha de nacimiento no puede ser futura."
            );
        }

        // Evitar documentos duplicados en la institución.
        boolean existe = fichaRepository
                .existsByInstitucionAndTipoDocumentoAndNumeroDocumento(
                        institucion,
                        tipoDocumento,
                        numeroDocumento
                );

        if (existe) {
            throw new IllegalArgumentException(
                    "Este documento ya está registrado en la institución."
            );
        }

        // Crear ficha.
        FichaBeneficiario ficha = new FichaBeneficiario();

        ficha.setInstitucion(institucion);

        ficha.setNombres(nombres);
        ficha.setApellidos(apellidos);

        ficha.setTipoDocumento(tipoDocumento);
        ficha.setNumeroDocumento(numeroDocumento);
        ficha.setFechaNacimiento(nacimiento);

        ficha.setSede(
                opcional(datos.sede(), 120)
        );

        ficha.setNivelDiscapacidadVisual(
                condicionVisual
        );

        ficha.setTecnologiaAsistencia(
                opcional(datos.tecnologiaAsistencia(), 200)
        );

        ficha.setPreferenciaComunicacion(
                opcional(datos.preferenciaComunicacion(), 60)
        );

        ficha.setRequiereLectorPantalla(
                Boolean.TRUE.equals(datos.requiereLectorPantalla())
        );

        ficha.setObservaciones(
                opcional(datos.observaciones(), 1000)
        );

        ficha.setTelefono(
                opcional(datos.telefono(), 20)
        );

        String email = opcional(datos.email(), 120);

        if (email != null) {
            email = email.toLowerCase(Locale.ROOT);

            if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                throw new IllegalArgumentException(
                        "El correo del beneficiario no es válido."
                );
            }
        }

        ficha.setEmail(email);

        ficha.setContactoEmergencia(
                opcional(datos.contactoEmergencia(), 160)
        );

        ficha.setTelefonoEmergencia(
                opcional(datos.telefonoEmergencia(), 20)
        );

        // Estado inicial del beneficiario.
        ficha.setEstado("EN_EVALUACION");

        // Guardar en MySQL.
        FichaBeneficiario guardada =
                fichaRepository.save(ficha);

        return guardada.getIdFicha();
    }

    /* ========================================
       2. LISTAR BENEFICIARIOS POR INSTITUCIÓN
    ======================================== */

    @Transactional(readOnly = true)
    public Page<FichaResumen> listar(
            String correoInstitucion,
            int pagina,
            int cantidad) {

        // Obtener la institución de la sesión.
        var usuario = usuarioRepository
                .findByEmail(correoInstitucion)
                .orElseThrow(() -> new AccessDeniedException(
                        "Institución no autorizada."
                ));

        if (!(usuario instanceof Institucion institucion)) {
            throw new AccessDeniedException(
                    "Acceso exclusivo para instituciones."
            );
        }

        if (!"ACTIVO".equalsIgnoreCase(
                institucion.getEstadoUsuario())) {

            throw new AccessDeniedException(
                    "La institución no está activa."
            );
        }

        // Configurar paginación.
        var paginacion = PageRequest.of(
                Math.max(0, pagina),
                Math.min(Math.max(1, cantidad), 50),
                Sort.by(
                        Sort.Direction.DESC,
                        "fechaRegistro"
                )
        );

        // Consultar únicamente beneficiarios propios.
        return fichaRepository
                .findByInstitucion(institucion, paginacion)
                .map(ficha -> new FichaResumen(
                        ficha.getIdFicha(),
                        ficha.getTipoDocumento(),
                        ficha.getNumeroDocumento(),
                        ficha.getNombres(),
                        ficha.getApellidos(),
                        ficha.getNivelDiscapacidadVisual(),
                        ficha.getTelefono(),
                        ficha.getFechaRegistro(),
                        ficha.getEstado(),
                        ficha.getRequiereLectorPantalla()
                ));
    }

    /* ========================================
       3. DATOS PARA LA TABLA DE BENEFICIARIOS
    ======================================== */

    public record FichaResumen(
            Integer idFicha,
            String tipoDocumento,
            String numeroDocumento,
            String nombres,
            String apellidos,
            String nivelDiscapacidadVisual,
            String telefono,
            LocalDateTime fechaRegistro,
            String estado,
            Boolean requiereLectorPantalla
    ) {
    }

    /* ========================================
       4. VALIDACIONES
    ======================================== */

    private String obligatorio(
            String valor,
            String nombreCampo,
            int longitudMaxima) {

        String limpio = opcional(valor, longitudMaxima);

        if (limpio == null) {
            throw new IllegalArgumentException(
                    "El campo " + nombreCampo + " es obligatorio."
            );
        }

        return limpio;
    }

    private String opcional(
            String valor,
            int longitudMaxima) {

        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }

        String limpio = valor.trim();

        if (limpio.length() > longitudMaxima) {
            throw new IllegalArgumentException(
                    "Un campo supera la longitud máxima permitida."
            );
        }

        return limpio;
    }
}
