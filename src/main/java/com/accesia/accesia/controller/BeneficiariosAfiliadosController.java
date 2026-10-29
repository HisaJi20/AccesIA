
package com.accesia.accesia.controller;

import com.accesia.accesia.service.BeneficiariosAfiliadosService;

import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
    "/api/instituciones/beneficiarios-afiliados"
)
public class BeneficiariosAfiliadosController {

    private final BeneficiariosAfiliadosService servicio;

    public BeneficiariosAfiliadosController(
            BeneficiariosAfiliadosService servicio
    ) {
        this.servicio = servicio;
    }

    /* =========================================
       LISTAR BENEFICIARIOS APROBADOS
    ========================================= */

    @GetMapping
    public Page<BeneficiariosAfiliadosService.AfiliadoResumen>
    listar(
            Authentication autenticacion,
            @RequestParam(
                    defaultValue = "0"
            ) int pagina
    ) {
        return servicio.listar(
                autenticacion,
                pagina
        );
    }

    /* =========================================
       CONSULTAR FICHA DE AFILIACIÓN
    ========================================= */

    @GetMapping("/{idAfiliacion}")
    public BeneficiariosAfiliadosService.FichaAfiliado
    consultar(
            @PathVariable Long idAfiliacion,
            Authentication autenticacion
    ) {
        return servicio.consultarFicha(
                autenticacion,
                idAfiliacion
        );
    }
}
