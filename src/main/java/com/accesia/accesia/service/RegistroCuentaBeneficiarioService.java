
package com.accesia.accesia.service;

import com.accesia.accesia.dto.RegistroCuentaBeneficiarioRequest;
import com.accesia.accesia.model.Beneficiario;
import com.accesia.accesia.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;

@Service
public class RegistroCuentaBeneficiarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

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

    public RegistroCuentaBeneficiarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Integer registrar(
            RegistroCuentaBeneficiarioRequest datos) {

        if (datos == null) {
            throw new IllegalArgumentException(
                    "Los datos de registro son obligatorios."
            );
        }

        /* =====================================
           1. VALIDAR INFORMACIÓN PERSONAL
        ===================================== */

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

        String email = obligatorio(
                datos.email(),
                "Correo electrónico",
                120
        ).toLowerCase(Locale.ROOT);

        if (!email.matches(
                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
        )) {
            throw new IllegalArgumentException(
                    "Ingresa un correo electrónico válido."
            );
        }

        /* =====================================
           2. VALIDAR CONTRASEÑA
        ===================================== */

        String clave = datos.clave();

        if (clave == null || clave.length() < 10) {
            throw new IllegalArgumentException(
                    "La contraseña debe tener al menos 10 caracteres."
            );
        }

        if (clave.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException(
                    "La contraseña es demasiado larga para " +
                    "el sistema de cifrado configurado."
            );
        }

        /* =====================================
           3. VALIDAR CORREO DUPLICADO
        ===================================== */

        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Este correo electrónico ya tiene una cuenta en AccesIA."
            );
        }

        /* =====================================
           4. DOCUMENTO DE IDENTIDAD
        ===================================== */

        String tipoDocumento = opcional(
                datos.tipoDocumento(),
                20
        );

        String numeroDocumento = opcional(
                datos.numeroDocumento(),
                20
        );

        if ((tipoDocumento == null) !=
                (numeroDocumento == null)) {

            throw new IllegalArgumentException(
                    "Completa el tipo y número de documento."
            );
        }

        if (tipoDocumento != null) {

            tipoDocumento =
                    tipoDocumento.toUpperCase(Locale.ROOT);

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
        }

        /* =====================================
           5. FECHA DE NACIMIENTO
        ===================================== */

        LocalDate nacimiento = datos.fechaNacimiento();

        if (nacimiento != null
                && nacimiento.isAfter(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "La fecha de nacimiento no puede ser futura."
            );
        }

        /* =====================================
           6. ACCESIBILIDAD
        ===================================== */

        String condicionVisual = opcional(
                datos.nivelDiscapacidadVisual(),
                60
        );

        if (condicionVisual != null
                && !CONDICIONES.contains(condicionVisual)) {

            throw new IllegalArgumentException(
                    "La condición visual no es válida."
            );
        }

        String comunicacion = opcional(
                datos.preferenciaComunicacion(),
                60
        );

        String telefono = opcional(
                datos.telefono(),
                20
        );

        /* =====================================
           7. CREAR CUENTA DEL BENEFICIARIO
        ===================================== */

        Beneficiario beneficiario = new Beneficiario();

        beneficiario.setNombres(nombres);
        beneficiario.setApellidos(apellidos);

        beneficiario.setEmail(email);

        // Guardar solamente el hash BCrypt.
        beneficiario.setPasswordHash(
                passwordEncoder.encode(clave)
        );

        beneficiario.setEstadoUsuario("ACTIVO");

        beneficiario.setTipoDocumento(tipoDocumento);
        beneficiario.setNumeroDocumento(numeroDocumento);

        beneficiario.setFechaNacimiento(nacimiento);
        beneficiario.setTelefono(telefono);

        beneficiario.setNivelDiscapacidadVisual(
                condicionVisual
        );

        beneficiario.setPreferenciaComunicacion(
                comunicacion
        );

        beneficiario.setRequiereLectorPantalla(
                Boolean.TRUE.equals(
                        datos.requiereLectorPantalla()
                )
        );

        /* =====================================
           8. GUARDAR EN MYSQL
        ===================================== */

        usuarioRepository.saveAndFlush(beneficiario);

        return beneficiario.getIdUsuario();
    }

    private String obligatorio(
            String valor,
            String nombreCampo,
            int maximo) {

        String limpio = opcional(valor, maximo);

        if (limpio == null) {
            throw new IllegalArgumentException(
                    "El campo " + nombreCampo + " es obligatorio."
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
                    "Un campo supera la longitud máxima permitida."
            );
        }

        return limpio;
    }
}
