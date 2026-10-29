package com.accesia.accesia.controller;

import com.accesia.accesia.model.Beneficiario;
import com.accesia.accesia.repository.BeneficiarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiarios")
@CrossOrigin(origins = "*")
public class BeneficiarioController {

    private final BeneficiarioRepository beneficiarioRepository;

    public BeneficiarioController(BeneficiarioRepository beneficiarioRepository) {
        this.beneficiarioRepository = beneficiarioRepository;
    }

    // Listar todos los beneficiarios
    @GetMapping
    public List<Beneficiario> listarBeneficiarios() {
        return beneficiarioRepository.findAll();
    }

    // Buscar beneficiario por ID
    @GetMapping("/{id}")
    public ResponseEntity<Beneficiario> obtenerBeneficiario(@PathVariable Integer id) {
        return beneficiarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Buscar beneficiario por número de documento
    @GetMapping("/documento/{numeroDocumento}")
    public ResponseEntity<Beneficiario> obtenerPorDocumento(
            @PathVariable String numeroDocumento) {

        return beneficiarioRepository
                .findByNumeroDocumento(numeroDocumento)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}