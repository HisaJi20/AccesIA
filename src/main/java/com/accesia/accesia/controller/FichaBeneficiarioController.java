
package com.accesia.accesia.controller;

import com.accesia.accesia.dto.RegistroFichaBeneficiarioRequest;
import com.accesia.accesia.service.FichaBeneficiarioService;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/instituciones/beneficiarios")
public class FichaBeneficiarioController {

    private final FichaBeneficiarioService fichaService;

    public FichaBeneficiarioController(
            FichaBeneficiarioService fichaService) {

        this.fichaService = fichaService;
    }

    /* =========================================
       1. REGISTRAR BENEFICIARIO
    ========================================= */

    @PostMapping
    public ResponseEntity<Map<String, Object>> registrar(
            @RequestBody RegistroFichaBeneficiarioRequest datos,
            Authentication authentication) {

        if (!esInstitucion(authentication)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "mensaje",
                            "No tienes permisos para registrar beneficiarios."
                    ));
        }

        try {

            Integer idFicha = fichaService.registrar(
                    datos,
                    authentication.getName()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "mensaje",
                            "Beneficiario registrado correctamente.",
                            "idFicha",
                            idFicha
                    ));

        } catch (AccessDeniedException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "mensaje",
                            "No tienes permisos para esta operación."
                    ));

        } catch (IllegalArgumentException e) {

            String mensaje = e.getMessage() == null
                    ? "Datos de registro inválidos."
                    : e.getMessage();

            HttpStatus estado =
                    mensaje.contains("ya está registrado")
                            ? HttpStatus.CONFLICT
                            : HttpStatus.BAD_REQUEST;

            return ResponseEntity
                    .status(estado)
                    .body(Map.of("mensaje", mensaje));

        } catch (DataIntegrityViolationException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "mensaje",
                            "Ya existe un registro con estos datos."
                    ));
        }
    }

    /* =========================================
       2. LISTAR BENEFICIARIOS
    ========================================= */

    @GetMapping
    public ResponseEntity<
            Page<FichaBeneficiarioService.FichaResumen>
            > listar(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int cantidad) {

        if (!esInstitucion(authentication)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        try {

            var resultado = fichaService.listar(
                    authentication.getName(),
                    pagina,
                    cantidad
            );

            return ResponseEntity.ok(resultado);

        } catch (AccessDeniedException e) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }
    }

    /* =========================================
       3. VALIDACIÓN DEL ROL INSTITUCIONAL
    ========================================= */

    private boolean esInstitucion(
            Authentication authentication) {

        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities()
                    .stream()
                    .anyMatch(autoridad ->
                            "ROLE_INSTITUCION".equals(
                                    autoridad.getAuthority()
                            )
                    );
    }
}
