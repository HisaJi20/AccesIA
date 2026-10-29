
package com.accesia.accesia.service;

import com.accesia.accesia.dto.RegistroInstitucionRequest;
import com.accesia.accesia.model.Institucion;
import com.accesia.accesia.repository.InstitucionRepository;
import com.accesia.accesia.repository.UsuarioRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class InstitucionService {

    private final InstitucionRepository institucionRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public InstitucionService(
            InstitucionRepository institucionRepository,
            UsuarioRepository usuarioRepository) {

        this.institucionRepository = institucionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Integer registrarInstitucion(
            RegistroInstitucionRequest datos) {

        if (datos == null) {
            throw new IllegalArgumentException(
                    "Debe proporcionar los datos de registro.");
        }

        String razonSocial = limpiar(datos.razonSocial());
        String ruc = limpiar(datos.ruc());
        String email = limpiar(datos.email())
                .toLowerCase(Locale.ROOT);
        String contrasena = datos.contrasena();

        if (razonSocial.isBlank()) {
            throw new IllegalArgumentException(
                    "La razon social es obligatoria.");
        }

        if (!ruc.matches("\\d{11}")) {
            throw new IllegalArgumentException(
                    "El RUC debe tener 11 digitos.");
        }

        if (email.isBlank()
                || email.length() > 120
                || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {

            throw new IllegalArgumentException(
                    "Ingrese un correo electronico valido.");
        }

        if (contrasena == null || contrasena.length() < 8) {
            throw new IllegalArgumentException(
                    "La contraseña debe tener al menos 8 caracteres.");
        }

        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "El correo electronico ya esta registrado.");
        }

        if (institucionRepository.existsByRuc(ruc)) {
            throw new IllegalArgumentException(
                    "El RUC ya esta registrado.");
        }

        Institucion institucion = new Institucion();

        institucion.setRazonSocial(razonSocial);
        institucion.setRuc(ruc);
        institucion.setTipoInstitucion(
                limpiar(datos.tipoInstitucion()));
        institucion.setNombreResponsable(
                limpiar(datos.nombreResponsable()));
        institucion.setCargoResponsable(
                limpiar(datos.cargoResponsable()));
        institucion.setTelefono(
                limpiar(datos.telefono()));
        institucion.setDireccion(
                limpiar(datos.direccion()));
        institucion.setRegion(
                limpiar(datos.region()));
        institucion.setProvincia(
                limpiar(datos.provincia()));
        institucion.setDistrito(
                limpiar(datos.distrito()));

        institucion.setEmail(email);
        institucion.setPasswordHash(
                passwordEncoder.encode(contrasena));

        Institucion guardada =
                institucionRepository.save(institucion);

        return guardada.getIdUsuario();
    }

    private String limpiar(String valor) {
        return valor == null ? "" : valor.trim();
    }
}
