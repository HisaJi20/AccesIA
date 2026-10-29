
package com.accesia.accesia.repository;

import com.accesia.accesia.model.Institucion;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InstitucionRepository
        extends JpaRepository<Institucion, Integer> {

    // Buscar institución por RUC.
    Optional<Institucion> findByRuc(String ruc);

    // Verificar si el RUC ya está registrado.
    boolean existsByRuc(String ruc);

    // Buscar instituciones activas por razón social.
    // Permite paginar los resultados de búsqueda.
    Page<Institucion>
    findByEstadoUsuarioIgnoreCaseAndRazonSocialContainingIgnoreCase(
            String estadoUsuario,
            String razonSocial,
            Pageable pageable
    );
}
