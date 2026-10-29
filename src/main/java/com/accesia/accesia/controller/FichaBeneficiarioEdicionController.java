
package com.accesia.accesia.controller;

import com.accesia.accesia.dto.RegistroFichaBeneficiarioRequest;
import com.accesia.accesia.service.FichaBeneficiarioEdicionService;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/instituciones/beneficiarios")
public class FichaBeneficiarioEdicionController {

    private final FichaBeneficiarioEdicionService edicionService;

    public FichaBeneficiarioEdicionController(
            FichaBeneficiarioEdicionService edicionService) {

        this.edicionService = edicionService;
    }

    /* =========================================
       EDITAR BENEFICIARIO
       PUT /api/instituciones/beneficiarios/{idFicha}
    ========================================= */

    @PutMapping("/{idFicha}")
    public ResponseEntity<Map<String, Object>> editar(
            @PathVariable Integer idFicha,
            @RequestBody RegistroFichaBeneficiarioRequest datos,
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getAuthorities()
                    .stream()
                    .noneMatch(autoridad ->
                            "ROLE_INSTITUCION".equals(
                                    autoridad.getAuthority()
                            )
                    )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "mensaje",
                            "No tienes permiso para editar beneficiarios."
                    ));
        }

        try {

            edicionService.editar(
                    idFicha,
                    datos,
                    authentication.getName()
            );

            return ResponseEntity.ok(Map.of(
                    "mensaje",
                    "Ficha actualizada correctamente.",
                    "idFicha",
                    idFicha
            ));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "mensaje",
                            e.getMessage() == null
                                    ? "Datos inválidos."
                                    : e.getMessage()
                    ));

        } catch (ResponseStatusException e) {

            return ResponseEntity
                    .status(e.getStatusCode())
                    .body(Map.of(
                            "mensaje",
                            e.getReason() == null
                                    ? "No se pudo editar la ficha."
                                    : e.getReason()
                    ));

        } catch (DataIntegrityViolationException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "mensaje",
                            "El documento ya está registrado."
                    ));
        }
    }
}
