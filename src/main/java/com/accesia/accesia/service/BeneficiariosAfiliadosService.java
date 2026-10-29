
package com.accesia.accesia.service;

import com.accesia.accesia.model.AfiliacionInstitucional;
import com.accesia.accesia.model.Beneficiario;
import com.accesia.accesia.model.Institucion;
import com.accesia.accesia.model.Usuario;

import com.accesia.accesia.repository.AfiliacionInstitucionalRepository;
import com.accesia.accesia.repository.UsuarioRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class BeneficiariosAfiliadosService {

    private final AfiliacionInstitucionalRepository afiliaciones;
    private final UsuarioRepository usuarios;

    public BeneficiariosAfiliadosService(
            AfiliacionInstitucionalRepository afiliaciones,
            UsuarioRepository usuarios
    ) {
        this.afiliaciones = afiliaciones;
        this.usuarios = usuarios;
    }

    /* =========================================
       RESPUESTA PARA EL LISTADO
    ========================================= */

    public record AfiliadoResumen(
            Long idAfiliacion,
            Integer idBeneficiario,
            String nombres,
            String apellidos,
            String nombreCompleto,
            String correo,
            String estado,
            LocalDateTime fechaAprobacion
    ) {}

    /* =========================================
       FICHA DE AFILIACIÓN CONSULTABLE
    ========================================= */

    public record FichaAfiliado(
            Long idAfiliacion,
            Integer idBeneficiario,
            String nombres,
            String apellidos,
            String nombreCompleto,
            String correo,
            String institucion,
            String estado,
            LocalDateTime fechaRegistroCuenta,
            LocalDateTime fechaSolicitud,
            LocalDateTime fechaAprobacion
    ) {}

    /* =========================================
       IDENTIFICAR INSTITUCIÓN AUTENTICADA
    ========================================= */

    private Institucion obtenerInstitucion(
            Authentication autenticacion
    ) {

        if (
            autenticacion == null ||
            !autenticacion.isAuthenticated()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debes iniciar sesión."
            );
        }

        boolean rolInstitucion =
                autenticacion.getAuthorities()
                .stream()
                .anyMatch(autoridad ->
                    "ROLE_INSTITUCION".equals(
                        autoridad.getAuthority()
                    )
                );

        if (!rolInstitucion) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acceso exclusivo para instituciones."
            );
        }

        String correo = autenticacion.getName();

        Usuario usuario = usuarios.findByEmail(correo)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "No se encontró la cuenta institucional."
                    )
                );

        if (!(usuario instanceof Institucion institucion)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La cuenta no es institucional."
            );
        }

        if (!"ACTIVO".equalsIgnoreCase(
                institucion.getEstadoUsuario()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La institución está inactiva."
            );
        }

        return institucion;
    }

    /* =========================================
       CONVERTIR ENTIDAD EN RESUMEN
    ========================================= */

    private AfiliadoResumen convertirResumen(
            AfiliacionInstitucional afiliacion
    ) {

        Beneficiario beneficiario =
                afiliacion.getBeneficiario();

        String nombreCompleto =
                (beneficiario.getNombres() + " " +
                 beneficiario.getApellidos()).trim();

        return new AfiliadoResumen(
                afiliacion.getIdAfiliacion(),
                beneficiario.getIdUsuario(),
                beneficiario.getNombres(),
                beneficiario.getApellidos(),
                nombreCompleto,
                beneficiario.getEmail(),
                afiliacion.getEstado().name(),
                afiliacion.getFechaDecision()
        );
    }

    /* =========================================
       CONVERTIR ENTIDAD EN FICHA
    ========================================= */

    private FichaAfiliado convertirFicha(
            AfiliacionInstitucional afiliacion
    ) {

        Beneficiario beneficiario =
                afiliacion.getBeneficiario();

        Institucion institucion =
                afiliacion.getInstitucion();

        String nombreCompleto =
                (beneficiario.getNombres() + " " +
                 beneficiario.getApellidos()).trim();

        return new FichaAfiliado(
                afiliacion.getIdAfiliacion(),
                beneficiario.getIdUsuario(),
                beneficiario.getNombres(),
                beneficiario.getApellidos(),
                nombreCompleto,
                beneficiario.getEmail(),
                institucion.getRazonSocial(),
                afiliacion.getEstado().name(),
                beneficiario.getFechaRegistro(),
                afiliacion.getFechaSolicitud(),
                afiliacion.getFechaDecision()
        );
    }

    /* =========================================
       LISTAR AFILIACIONES APROBADAS
    ========================================= */

    @Transactional(readOnly = true)
    public Page<AfiliadoResumen> listar(
            Authentication autenticacion,
            int pagina
    ) {

        Institucion institucion =
                obtenerInstitucion(autenticacion);

        if (pagina < 0 || pagina > 100000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Número de página inválido."
            );
        }

        PageRequest paginacion = PageRequest.of(
                pagina,
                10,
                Sort.by(
                    Sort.Direction.DESC,
                    "fechaDecision"
                ).and(
                    Sort.by(
                        Sort.Direction.DESC,
                        "idAfiliacion"
                    )
                )
        );

        Page<AfiliacionInstitucional> resultado =
                afiliaciones
                .findByInstitucion_IdUsuarioAndEstado(
                    institucion.getIdUsuario(),
                    AfiliacionInstitucional.Estado.APROBADA,
                    paginacion
                );

        return resultado.map(this::convertirResumen);
    }

    /* =========================================
       CONSULTAR FICHA DEL AFILIADO
    ========================================= */

    @Transactional(readOnly = true)
    public FichaAfiliado consultarFicha(
            Authentication autenticacion,
            Long idAfiliacion
    ) {

        Institucion institucion =
                obtenerInstitucion(autenticacion);

        if (
            idAfiliacion == null ||
            idAfiliacion <= 0
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Identificador de afiliación inválido."
            );
        }

        AfiliacionInstitucional afiliacion =
                afiliaciones
                .findByIdAfiliacionAndInstitucion_IdUsuarioAndEstado(
                    idAfiliacion,
                    institucion.getIdUsuario(),
                    AfiliacionInstitucional.Estado.APROBADA
                )
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La afiliación aprobada no existe " +
                        "o no pertenece a esta institución."
                    )
                );

        return convertirFicha(afiliacion);
    }
}
