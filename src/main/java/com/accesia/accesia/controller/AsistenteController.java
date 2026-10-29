package com.accesia.accesia.controller;

import com.accesia.accesia.dto.ConsultaAsistente;
import com.accesia.accesia.dto.RespuestaAsistente;
import com.accesia.accesia.service.AsistenteService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;

@RestController
@RequestMapping("/api/asistente")
public class AsistenteController {

    private final AsistenteService asistenteService;

    public AsistenteController(AsistenteService asistenteService) {
        this.asistenteService = asistenteService;
    }

    @PostMapping
    public ResponseEntity<RespuestaAsistente> consultar(
            @RequestBody ConsultaAsistente consulta) {

        if (consulta == null) {
            return ResponseEntity.badRequest().body(
                    new RespuestaAsistente("Escribe una consulta.")
            );
        }

        try {
            String respuesta = asistenteService.responder(
                    consulta.mensaje()
            );

            return ResponseEntity.ok(
                    new RespuestaAsistente(respuesta)
            );

        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(
                    new RespuestaAsistente(error.getMessage())
            );

        } catch (RestClientException error) {
            return ResponseEntity.status(
                    HttpStatus.SERVICE_UNAVAILABLE
            ).body(
                    new RespuestaAsistente(
                            "No se pudo consultar a Ollama. "
                            + "Comprueba que esté ejecutándose "
                            + "y que el modelo esté disponible."
                    )
            );

        } catch (IllegalStateException error) {
            return ResponseEntity.status(
                    HttpStatus.BAD_GATEWAY
            ).body(
                    new RespuestaAsistente(
                            "Ollama no devolvió una respuesta válida. "
                            + "Intenta nuevamente."
                    )
            );
        }
    }
}