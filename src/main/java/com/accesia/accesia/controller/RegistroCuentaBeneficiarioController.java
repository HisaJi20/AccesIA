
package com.accesia.accesia.controller;

import com.accesia.accesia.dto.RegistroCuentaBeneficiarioRequest;
import com.accesia.accesia.service.RegistroCuentaBeneficiarioService;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/beneficiarios")
public class RegistroCuentaBeneficiarioController {

    private final RegistroCuentaBeneficiarioService servicio;

    public RegistroCuentaBeneficiarioController(
            RegistroCuentaBeneficiarioService servicio) {

        this.servicio = servicio;
    }

    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> registrar(
            @RequestBody RegistroCuentaBeneficiarioRequest datos) {

        try {
            Integer idUsuario = servicio.registrar(datos);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "mensaje",
                            "Cuenta de beneficiario registrada correctamente.",
                            "idUsuario",
                            idUsuario
                    ));

        } catch (IllegalArgumentException e) {

            String mensaje = e.getMessage() == null
                    ? "Datos de registro inválidos."
                    : e.getMessage();

            HttpStatus estado =
                    mensaje.contains("ya tiene una cuenta")
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
                            "El correo o documento ya está registrado."
                    ));
        }
    }
}
