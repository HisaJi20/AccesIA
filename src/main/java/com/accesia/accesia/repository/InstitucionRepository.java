
package com.accesia.accesia.repository;

import com.accesia.accesia.model.Institucion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InstitucionRepository
        extends JpaRepository<Institucion, Integer> {

    // Buscar institución por RUC.
    Optional<Institucion> findByRuc(String ruc);

    // Verificar si el RUC ya está registrado.
    boolean existsByRuc(String ruc);
}
