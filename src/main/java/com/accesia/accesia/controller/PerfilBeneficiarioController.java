
package com.accesia.accesia.controller;

import com.accesia.accesia.service.PerfilBeneficiarioService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/beneficiarios/mi-perfil")
public class PerfilBeneficiarioController {

    private final PerfilBeneficiarioService servicio;

    public PerfilBeneficiarioController(
            PerfilBeneficiarioService servicio) {
        this.servicio = servicio;
    }

    private String obtenerCorreo(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getAuthorities().stream()
                    .noneMatch(a ->
                        "ROLE_BENEFICIARIO".equals(
                            a.getAuthority()
                        )
                    )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No autorizado."
            );
        }

        return authentication.getName();
    }

    @GetMapping
    public PerfilBeneficiarioService.PerfilResponse consultar(
            Authentication authentication) {

        return servicio.consultar(
                obtenerCorreo(authentication)
        );
    }

    @PutMapping
    public PerfilBeneficiarioService.PerfilResponse actualizar(
            @RequestBody
            PerfilBeneficiarioService.ActualizarPerfilRequest datos,
            Authentication authentication) {

        return servicio.actualizar(
                obtenerCorreo(authentication),
                datos
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> errorDatos(
            IllegalArgumentException ex) {

        return ResponseEntity.badRequest().body(
                Map.of(
                        "mensaje",
                        ex.getMessage() == null
                                ? "Datos inválidos."
                                : ex.getMessage()
                )
        );
    }
}
