
package com.accesia.accesia.repository;

import com.accesia.accesia.model.AfiliacionInstitucional;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.List;
import java.util.Optional;

public interface AfiliacionInstitucionalRepository
        extends JpaRepository<AfiliacionInstitucional, Long> {

    // Buscar la relación entre beneficiario e institución.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<AfiliacionInstitucional>
    findByBeneficiario_IdUsuarioAndInstitucion_IdUsuario(
            Integer idBeneficiario,
            Integer idInstitucion
    );

    // Solicitudes de la cuenta personal.
    List<AfiliacionInstitucional>
    findByBeneficiario_IdUsuarioOrderByFechaSolicitudDesc(
            Integer idBeneficiario
    );

    // Solicitudes recibidas por la institución.
    List<AfiliacionInstitucional>
    findByInstitucion_IdUsuarioOrderByFechaSolicitudDesc(
            Integer idInstitucion
    );

    // Localizar una solicitud para aprobarla o rechazarla.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<AfiliacionInstitucional>
    findByIdAfiliacionAndInstitucion_IdUsuario(
            Long idAfiliacion,
            Integer idInstitucion
    );

    /* =========================================
       NUEVO: LISTAR BENEFICIARIOS APROBADOS
    ========================================= */

    @EntityGraph(attributePaths = {
            "beneficiario",
            "institucion"
    })
    Page<AfiliacionInstitucional>
    findByInstitucion_IdUsuarioAndEstado(
            Integer idInstitucion,
            AfiliacionInstitucional.Estado estado,
            Pageable pageable
    );

    /* =========================================
       NUEVO: CONSULTAR UN AFILIADO APROBADO
    ========================================= */

    @EntityGraph(attributePaths = {
            "beneficiario",
            "institucion"
    })
    Optional<AfiliacionInstitucional>
    findByIdAfiliacionAndInstitucion_IdUsuarioAndEstado(
            Long idAfiliacion,
            Integer idInstitucion,
            AfiliacionInstitucional.Estado estado
    );
}
