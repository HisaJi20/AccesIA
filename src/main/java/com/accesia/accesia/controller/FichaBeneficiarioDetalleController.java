
package com.accesia.accesia.controller;

import com.accesia.accesia.service.FichaBeneficiarioDetalleService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/instituciones/beneficiarios")
public class FichaBeneficiarioDetalleController {

    private final FichaBeneficiarioDetalleService detalleService;

    public FichaBeneficiarioDetalleController(
            FichaBeneficiarioDetalleService detalleService) {

        this.detalleService = detalleService;
    }

    @GetMapping("/{idFicha}")
    public FichaBeneficiarioDetalleService.FichaDetalle verFicha(
            @PathVariable Integer idFicha,
            Authentication authentication) {

        // Verificar el rol institucional.
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getAuthorities()
                    .stream()
                    .noneMatch(autoridad ->
                            "ROLE_INSTITUCION".equals(
                                    autoridad.getAuthority()
                            )
                    )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acceso no autorizado."
            );
        }

        return detalleService.obtener(
                idFicha,
                authentication.getName()
        );
    }
}
