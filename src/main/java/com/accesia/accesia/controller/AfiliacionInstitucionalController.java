
package com.accesia.accesia.controller;

import com.accesia.accesia.service.AfiliacionInstitucionalService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AfiliacionInstitucionalController {

    private final AfiliacionInstitucionalService servicio;

    public AfiliacionInstitucionalController(
            AfiliacionInstitucionalService servicio) {
        this.servicio = servicio;
    }

    public record SolicitudRequest(Integer idInstitucion) {}

    public record DecisionRequest(String accion) {}

    private String correo(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Inicia sesión."
            );
        }
        return auth.getName();
    }

    /* API DEL BENEFICIARIO */

    @GetMapping("/beneficiarios/instituciones")
    public List<AfiliacionInstitucionalService.InstitucionVista>
    instituciones(
            Authentication auth,
            @RequestParam(defaultValue = "") String q) {

        return servicio.buscarInstituciones(correo(auth), q);
    }

    @GetMapping("/beneficiarios/afiliaciones")
    public List<AfiliacionInstitucionalService.AfiliacionVista>
    misAfiliaciones(Authentication auth) {

        return servicio.misAfiliaciones(correo(auth));
    }

    @PostMapping("/beneficiarios/afiliaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public AfiliacionInstitucionalService.AfiliacionVista
    solicitar(
            @RequestBody SolicitudRequest datos,
            Authentication auth) {

        return servicio.solicitar(
                correo(auth),
                datos.idInstitucion()
        );
    }

    /* API DE LA INSTITUCIÓN */

    @GetMapping("/instituciones/afiliaciones")
    public List<AfiliacionInstitucionalService.AfiliacionVista>
    solicitudesInstitucion(Authentication auth) {

        return servicio.solicitudesInstitucion(correo(auth));
    }

    @PutMapping("/instituciones/afiliaciones/{id}/decision")
    public AfiliacionInstitucionalService.AfiliacionVista
    decidir(
            @PathVariable Long id,
            @RequestBody DecisionRequest datos,
            Authentication auth) {

        return servicio.decidir(
                correo(auth),
                id,
                datos.accion()
        );
    }
}
