
package com.accesia.accesia.service;

import com.accesia.accesia.model.Institucion;
import com.accesia.accesia.repository.FichaBeneficiarioRepository;
import com.accesia.accesia.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class FichaBeneficiarioDetalleService {

    private final FichaBeneficiarioRepository fichaRepository;
    private final UsuarioRepository usuarioRepository;

    public FichaBeneficiarioDetalleService(
            FichaBeneficiarioRepository fichaRepository,
            UsuarioRepository usuarioRepository) {

        this.fichaRepository = fichaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public FichaDetalle obtener(
            Integer idFicha,
            String correoInstitucion) {

        // Buscar la cuenta autenticada.
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

        // Consultar solo fichas de esta institución.
        var ficha = fichaRepository
                .findByIdFichaAndInstitucion(
                        idFicha,
                        institucion
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Ficha no encontrada."
                        )
                );

        // Enviar únicamente los campos necesarios.
        return new FichaDetalle(
                ficha.getIdFicha(),
                ficha.getNombres(),
                ficha.getApellidos(),
                ficha.getTipoDocumento(),
                ficha.getNumeroDocumento(),
                ficha.getFechaNacimiento(),
                ficha.getSede(),
                ficha.getNivelDiscapacidadVisual(),
                ficha.getTecnologiaAsistencia(),
                ficha.getPreferenciaComunicacion(),
                ficha.getRequiereLectorPantalla(),
                ficha.getObservaciones(),
                ficha.getTelefono(),
                ficha.getEmail(),
                ficha.getContactoEmergencia(),
                ficha.getTelefonoEmergencia(),
                ficha.getEstado(),
                ficha.getFechaRegistro()
        );
    }

    // Respuesta para visualizar la ficha institucional.
    public record FichaDetalle(
            Integer idFicha,
            String nombres,
            String apellidos,
            String tipoDocumento,
            String numeroDocumento,
            LocalDate fechaNacimiento,
            String sede,
            String nivelDiscapacidadVisual,
            String tecnologiaAsistencia,
            String preferenciaComunicacion,
            Boolean requiereLectorPantalla,
            String observaciones,
            String telefono,
            String email,
            String contactoEmergencia,
            String telefonoEmergencia,
            String estado,
            LocalDateTime fechaRegistro
    ) {
    }
}
