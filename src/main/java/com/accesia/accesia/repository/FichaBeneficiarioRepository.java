
package com.accesia.accesia.repository;

import com.accesia.accesia.model.FichaBeneficiario;
import com.accesia.accesia.model.Institucion;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FichaBeneficiarioRepository
        extends JpaRepository<FichaBeneficiario, Integer> {

    // Listar beneficiarios de una institución.
    Page<FichaBeneficiario> findByInstitucion(
            Institucion institucion,
            Pageable pageable
    );

    // Comprobar si existe el documento al registrar.
    boolean existsByInstitucionAndTipoDocumentoAndNumeroDocumento(
            Institucion institucion,
            String tipoDocumento,
            String numeroDocumento
    );

    // Contar beneficiarios de una institución.
    long countByInstitucion(
            Institucion institucion
    );

    // Consultar una ficha de la institución autenticada.
    Optional<FichaBeneficiario> findByIdFichaAndInstitucion(
            Integer idFicha,
            Institucion institucion
    );

    // Evitar duplicados al editar, excluyendo la ficha actual.
    boolean existsByInstitucionAndTipoDocumentoAndNumeroDocumentoAndIdFichaNot(
            Institucion institucion,
            String tipoDocumento,
            String numeroDocumento,
            Integer idFicha
    );
}
