
package com.accesia.accesia.controller;

import com.accesia.accesia.dto.RegistroInstitucionRequest;
import com.accesia.accesia.service.InstitucionService;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/instituciones")
public class InstitucionController {

    private final InstitucionService institucionService;

    public InstitucionController(
            InstitucionService institucionService) {

        this.institucionService = institucionService;
    }

    @PostMapping("/registro")
    public ResponseEntity<Map<String, Object>> registrar(
            @RequestBody RegistroInstitucionRequest datos) {

        try {

            Integer id = institucionService
                    .registrarInstitucion(datos);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "mensaje", "Institucion registrada correctamente.",
                            "idUsuario", id
                    ));

        } catch (IllegalArgumentException e) {

            HttpStatus estado = e.getMessage() != null
                    && e.getMessage().contains("ya esta registrado")
                    ? HttpStatus.CONFLICT
                    : HttpStatus.BAD_REQUEST;

            return ResponseEntity
                    .status(estado)
                    .body(Map.of(
                            "mensaje", e.getMessage() == null
                                    ? "Datos de registro invalidos."
                                    : e.getMessage()
                    ));

        } catch (DataIntegrityViolationException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "mensaje",
                            "El correo o RUC ya existe en el sistema."
                    ));
        }
    }
}
