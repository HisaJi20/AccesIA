
package com.accesia.accesia.dto;

public record RegistroInstitucionRequest(
    String razonSocial,
    String ruc,
    String tipoInstitucion,
    String nombreResponsable,
    String cargoResponsable,
    String telefono,
    String direccion,
    String region,
    String provincia,
    String distrito,
    String email,
    String contrasena
) {
}
