
package com.accesia.accesia.service;

import com.accesia.accesia.model.Beneficiario;
import com.accesia.accesia.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class PerfilBeneficiarioService {

    private final UsuarioRepository usuarioRepository;

    public PerfilBeneficiarioService(
            UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    private Beneficiario buscarBeneficiario(String correo) {

        if (correo == null || correo.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debes iniciar sesión."
            );
        }

        String email = correo.trim()
                .toLowerCase(Locale.ROOT);

        var usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cuenta no encontrada."
                        )
                );

        if (!(usuario instanceof Beneficiario beneficiario)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acceso exclusivo para beneficiarios."
            );
        }

        if (!"ACTIVO".equalsIgnoreCase(
                beneficiario.getEstadoUsuario())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La cuenta no está activa."
            );
        }

        return beneficiario;
    }

    @Transactional(readOnly = true)
    public PerfilResponse consultar(String correo) {

        return convertir(buscarBeneficiario(correo));
    }

    @Transactional
    public PerfilResponse actualizar(
            String correo,
            ActualizarPerfilRequest datos) {

        if (datos == null) {
            throw new IllegalArgumentException(
                    "Debes enviar los datos del perfil."
            );
        }

        Beneficiario beneficiario =
                buscarBeneficiario(correo);

        String telefono = limpiar(datos.telefono(), 20);

        String comunicacion = limpiar(
                datos.preferenciaComunicacion(),
                60
        );

        beneficiario.setTelefono(telefono);

        beneficiario.setPreferenciaComunicacion(
                comunicacion
        );

        beneficiario.setRequiereLectorPantalla(
                Boolean.TRUE.equals(
                        datos.requiereLectorPantalla()
                )
        );

        usuarioRepository.save(beneficiario);

        return convertir(beneficiario);
    }

    private String limpiar(String valor, int maximo) {

        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }

        String limpio = valor.trim();

        if (limpio.length() > maximo) {
            throw new IllegalArgumentException(
                    "Un campo supera la longitud permitida."
            );
        }

        return limpio;
    }

    private PerfilResponse convertir(Beneficiario b) {

        return new PerfilResponse(
                b.getIdUsuario(),
                b.getNombres(),
                b.getApellidos(),
                b.getEmail(),
                b.getTelefono(),
                b.getTipoDocumento(),
                b.getNumeroDocumento(),
                b.getFechaNacimiento(),
                b.getNivelDiscapacidadVisual(),
                b.getPreferenciaComunicacion(),
                b.getRequiereLectorPantalla(),
                b.getEstadoUsuario(),
                b.getFechaRegistro()
        );
    }

    public record ActualizarPerfilRequest(
            String telefono,
            String preferenciaComunicacion,
            Boolean requiereLectorPantalla
    ) {
    }

    public record PerfilResponse(
            Integer idUsuario,
            String nombres,
            String apellidos,
            String email,
            String telefono,
            String tipoDocumento,
            String numeroDocumento,
            LocalDate fechaNacimiento,
            String nivelDiscapacidadVisual,
            String preferenciaComunicacion,
            Boolean requiereLectorPantalla,
            String estadoUsuario,
            LocalDateTime fechaRegistro
    ) {
    }
}
