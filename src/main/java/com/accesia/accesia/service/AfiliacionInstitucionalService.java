
package com.accesia.accesia.service;

import com.accesia.accesia.model.*;
import com.accesia.accesia.repository.*;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class AfiliacionInstitucionalService {

    private final UsuarioRepository usuarios;
    private final InstitucionRepository instituciones;
    private final AfiliacionInstitucionalRepository afiliaciones;

    public AfiliacionInstitucionalService(
            UsuarioRepository usuarios,
            InstitucionRepository instituciones,
            AfiliacionInstitucionalRepository afiliaciones) {

        this.usuarios = usuarios;
        this.instituciones = instituciones;
        this.afiliaciones = afiliaciones;
    }

    public record InstitucionVista(
            Integer idInstitucion,
            String razonSocial,
            String tipoInstitucion,
            String provincia,
            String distrito
    ) {}

    public record AfiliacionVista(
            Long idAfiliacion,
            Integer idInstitucion,
            String institucion,
            String beneficiario,
            String correoBeneficiario,
            String estado,
            LocalDateTime fechaSolicitud,
            LocalDateTime fechaDecision
    ) {}

    private Usuario cuenta(String correo) {
        if (correo == null || correo.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debes iniciar sesión."
            );
        }

        Usuario usuario = usuarios.findByEmail(
                correo.trim().toLowerCase(Locale.ROOT)
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "La cuenta no existe."
        ));

        if (!"ACTIVO".equalsIgnoreCase(
                usuario.getEstadoUsuario())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La cuenta está inactiva."
            );
        }

        return usuario;
    }

    private Beneficiario beneficiario(String correo) {
        Usuario usuario = cuenta(correo);

        if (!(usuario instanceof Beneficiario b)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acceso exclusivo del beneficiario."
            );
        }

        return b;
    }

    private Institucion institucion(String correo) {
        Usuario usuario = cuenta(correo);

        if (!(usuario instanceof Institucion i)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acceso exclusivo institucional."
            );
        }

        return i;
    }

    private AfiliacionVista convertir(
            AfiliacionInstitucional a) {

        Beneficiario b = a.getBeneficiario();
        Institucion i = a.getInstitucion();

        return new AfiliacionVista(
                a.getIdAfiliacion(),
                i.getIdUsuario(),
                i.getRazonSocial(),
                (b.getNombres() + " " + b.getApellidos()).trim(),
                b.getEmail(),
                a.getEstado().name(),
                a.getFechaSolicitud(),
                a.getFechaDecision()
        );
    }

    /* =====================================
       BUSCAR INSTITUCIONES
    ===================================== */

    @Transactional(readOnly = true)
    public List<InstitucionVista> buscarInstituciones(
            String correo,
            String busqueda) {

        beneficiario(correo);

        String termino = busqueda == null
                ? ""
                : busqueda.trim();

        if (termino.length() > 80) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La búsqueda es demasiado larga."
            );
        }

        return instituciones
                .findByEstadoUsuarioIgnoreCaseAndRazonSocialContainingIgnoreCase(
                        "ACTIVO",
                        termino,
                        PageRequest.of(
                                0,
                                30,
                                Sort.by("razonSocial").ascending()
                        )
                )
                .getContent()
                .stream()
                .map(i -> new InstitucionVista(
                        i.getIdUsuario(),
                        i.getRazonSocial(),
                        i.getTipoInstitucion(),
                        i.getProvincia(),
                        i.getDistrito()
                ))
                .toList();
    }

    /* =====================================
       MIS AFILIACIONES
    ===================================== */

    @Transactional(readOnly = true)
    public List<AfiliacionVista> misAfiliaciones(
            String correo) {

        Beneficiario b = beneficiario(correo);

        return afiliaciones
                .findByBeneficiario_IdUsuarioOrderByFechaSolicitudDesc(
                        b.getIdUsuario()
                )
                .stream()
                .map(this::convertir)
                .toList();
    }

    /* =====================================
       SOLICITAR AFILIACIÓN
    ===================================== */

    @Transactional
    public AfiliacionVista solicitar(
            String correo,
            Integer idInstitucion) {

        Beneficiario b = beneficiario(correo);

        if (idInstitucion == null || idInstitucion <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selecciona una institución válida."
            );
        }

        Institucion i = instituciones
                .findById(idInstitucion)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Institución no encontrada."
                        )
                );

        if (!"ACTIVO".equalsIgnoreCase(
                i.getEstadoUsuario())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La institución no está activa."
            );
        }

        var existente = afiliaciones
                .findByBeneficiario_IdUsuarioAndInstitucion_IdUsuario(
                        b.getIdUsuario(),
                        i.getIdUsuario()
                );

        if (existente.isPresent()) {

            AfiliacionInstitucional a = existente.get();

            if (a.getEstado()
                    != AfiliacionInstitucional.Estado.RECHAZADA) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Ya tienes una solicitud pendiente " +
                        "o una afiliación aprobada."
                );
            }

            // Permitir una nueva solicitud después del rechazo.
            a.setEstado(
                    AfiliacionInstitucional.Estado.PENDIENTE
            );
            a.setFechaSolicitud(LocalDateTime.now());
            a.setFechaDecision(null);

            return convertir(afiliaciones.save(a));
        }

        AfiliacionInstitucional nueva =
                new AfiliacionInstitucional();

        nueva.setBeneficiario(b);
        nueva.setInstitucion(i);

        try {
            return convertir(
                    afiliaciones.saveAndFlush(nueva)
            );
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una afiliación para esta institución."
            );
        }
    }

    /* =====================================
       SOLICITUDES DE MI INSTITUCIÓN
    ===================================== */

    @Transactional(readOnly = true)
    public List<AfiliacionVista> solicitudesInstitucion(
            String correo) {

        Institucion i = institucion(correo);

        return afiliaciones
                .findByInstitucion_IdUsuarioOrderByFechaSolicitudDesc(
                        i.getIdUsuario()
                )
                .stream()
                .map(this::convertir)
                .toList();
    }

    /* =====================================
       APROBAR O RECHAZAR
    ===================================== */

    @Transactional
    public AfiliacionVista decidir(
            String correo,
            Long idAfiliacion,
            String accion) {

        Institucion i = institucion(correo);

        if (idAfiliacion == null || idAfiliacion <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Identificador inválido."
            );
        }

        String decision = accion == null
                ? ""
                : accion.trim().toUpperCase(Locale.ROOT);

        if (!decision.equals("APROBAR")
                && !decision.equals("RECHAZAR")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La decisión debe ser APROBAR o RECHAZAR."
            );
        }

        AfiliacionInstitucional a = afiliaciones
                .findByIdAfiliacionAndInstitucion_IdUsuario(
                        idAfiliacion,
                        i.getIdUsuario()
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Solicitud no encontrada en tu institución."
                        )
                );

        if (a.getEstado()
                != AfiliacionInstitucional.Estado.PENDIENTE) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esta solicitud ya fue evaluada."
            );
        }

        if (decision.equals("APROBAR")) {
            a.setEstado(
                    AfiliacionInstitucional.Estado.APROBADA
            );
        } else {
            a.setEstado(
                    AfiliacionInstitucional.Estado.RECHAZADA
            );
        }

        a.setFechaDecision(LocalDateTime.now());

        return convertir(afiliaciones.save(a));
    }
}
