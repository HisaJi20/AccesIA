
package com.accesia.accesia.dto;

import java.time.LocalDate;

public record RegistroFichaBeneficiarioRequest(

    String nombres,
    String apellidos,

    String tipoDocumento,
    String numeroDocumento,
    LocalDate fechaNacimiento,
    String sede,

    String nivelDiscapacidadVisual,
    String tecnologiaAsistencia,
    String preferenciaComunicacion,
    Boolean requiereLectorPantalla,
    String observaciones,

    String telefono,
    String email,
    String contactoEmergencia,
    String telefonoEmergencia

) {
}
