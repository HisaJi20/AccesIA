
package com.accesia.accesia.dto;

import java.time.LocalDate;

public record RegistroCuentaBeneficiarioRequest(
        String nombres,
        String apellidos,
        String email,
        String clave,

        String tipoDocumento,
        String numeroDocumento,
        LocalDate fechaNacimiento,
        String telefono,

        String nivelDiscapacidadVisual,
        String preferenciaComunicacion,
        Boolean requiereLectorPantalla
) {
}
