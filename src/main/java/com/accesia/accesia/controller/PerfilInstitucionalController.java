
package com.accesia.accesia.controller;

import com.accesia.accesia.model.Institucion;
import com.accesia.accesia.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/instituciones")
public class PerfilInstitucionalController {

    private final UsuarioRepository usuarioRepository;

    public PerfilInstitucionalController(
            UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/mi-perfil")
    public ResponseEntity<PerfilInstitucionalResponse> miPerfil(
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        var usuario = usuarioRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (!(usuario instanceof Institucion institucion)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        return ResponseEntity.ok(
                new PerfilInstitucionalResponse(
                        institucion.getRazonSocial(),
                        institucion.getRuc(),
                        institucion.getNombreResponsable(),
                        institucion.getEmail()
                )
        );
    }

    public record PerfilInstitucionalResponse(
            String razonSocial,
            String ruc,
            String nombreResponsable,
            String email
    ) {
    }
}
