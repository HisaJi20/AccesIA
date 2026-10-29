package com.accesia.accesia.repository;

import com.accesia.accesia.model.Beneficiario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BeneficiarioRepository extends JpaRepository<Beneficiario, Integer> {

    Optional<Beneficiario> findByNumeroDocumento(String numeroDocumento);
}