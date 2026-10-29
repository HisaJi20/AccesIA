
package com.accesia.accesia.config;

import com.accesia.accesia.model.Beneficiario;
import com.accesia.accesia.model.Institucion;
import com.accesia.accesia.repository.UsuarioRepository;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Locale;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /* =========================================
       AUTENTICACIÓN DE AMBOS TIPOS DE USUARIO
    ========================================= */

    @Bean
    public UserDetailsService userDetailsService(
            UsuarioRepository usuarioRepository) {

        return correo -> {

            String email = correo.trim()
                    .toLowerCase(Locale.ROOT);

            var usuario = usuarioRepository
                    .findByEmail(email)
                    .orElseThrow(() ->
                            new UsernameNotFoundException(
                                    "Credenciales incorrectas"
                            )
                    );

            String rol;

            if (usuario instanceof Institucion) {

                rol = "INSTITUCION";

            } else if (usuario instanceof Beneficiario) {

                rol = "BENEFICIARIO";

            } else {

                throw new UsernameNotFoundException(
                        "Tipo de usuario no autorizado."
                );
            }

            boolean activo = "ACTIVO".equalsIgnoreCase(
                    usuario.getEstadoUsuario()
            );

            return User.withUsername(usuario.getEmail())
                    .password(usuario.getPasswordHash())
                    .roles(rol)
                    .disabled(!activo)
                    .build();
        };
    }

    /* =========================================
       PROTECCIÓN DE RUTAS
    ========================================= */

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http.authorizeHttpRequests(auth -> auth

                /* RECURSOS PÚBLICOS */

                .requestMatchers(
                        "/",
                        "/index.html",
                        "/login-institucion.html",
                        "/registro-institucion.html",
                        "/login-beneficiario.html",
                        "/registro-beneficiario.html",
                        "/css/**",
                        "/js/**",
                        "/img/**",
                        "/images/**",
                        "/assets/**",
                        "/favicon.ico"
                ).permitAll()

                /* CSRF */

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/auth/csrf"
                ).permitAll()

                /* REGISTROS PÚBLICOS */

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/instituciones/registro"
                ).permitAll()

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/beneficiarios/registro"
                ).permitAll()

                /* PANELES PROTEGIDOS */

                .requestMatchers(
                        "/panel-institucion.html"
                ).hasRole("INSTITUCION")

                .requestMatchers(
                        "/panel-beneficiario.html"
                ).hasRole("BENEFICIARIO")

                /* GESTIÓN INSTITUCIONAL */

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/instituciones/beneficiarios"
                ).hasRole("INSTITUCION")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/instituciones/beneficiarios"
                ).hasRole("INSTITUCION")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/instituciones/beneficiarios/*"
                ).hasRole("INSTITUCION")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/instituciones/beneficiarios/*"
                ).hasRole("INSTITUCION")

                /* RESTO DE APIS POR ROL */

                .requestMatchers(
                        "/api/instituciones/**"
                ).hasRole("INSTITUCION")

                .requestMatchers(
                        "/api/beneficiarios/**"
                ).hasRole("BENEFICIARIO")

                /* RESTO DE ENDPOINTS */

                .anyRequest().authenticated()
        );

        // Mantener protección CSRF en login y edición.
        // Solo los registros institucionales anteriores
        // conservan su excepción existente.
        http.csrf(csrf -> csrf
                .ignoringRequestMatchers(
                        "/api/instituciones/registro"
                )
        );

        /* =========================================
           LOGIN COMPARTIDO CON RESPUESTA POR ROL
        ========================================= */

        http.formLogin(form -> form

                .loginPage("/login-institucion.html")

                .loginProcessingUrl("/api/auth/login")

                .usernameParameter("correo")
                .passwordParameter("clave")

                .successHandler(
                        (request, response, authentication) -> {

                            boolean esInstitucion =
                                    authentication.getAuthorities()
                                            .stream()
                                            .anyMatch(a ->
                                                    "ROLE_INSTITUCION"
                                                            .equals(
                                                                    a.getAuthority()
                                                            )
                                            );

                            boolean esBeneficiario =
                                    authentication.getAuthorities()
                                            .stream()
                                            .anyMatch(a ->
                                                    "ROLE_BENEFICIARIO"
                                                            .equals(
                                                                    a.getAuthority()
                                                            )
                                            );

                            String rol;
                            String destino;

                            if (esInstitucion) {

                                rol = "INSTITUCION";
                                destino = "/panel-institucion.html";

                            } else if (esBeneficiario) {

                                rol = "BENEFICIARIO";
                                destino = "/panel-beneficiario.html";

                            } else {

                                response.sendError(403);
                                return;
                            }

                            response.setStatus(200);

                            response.setContentType(
                                    "application/json;charset=UTF-8"
                            );

                            response.getWriter().write(
                                    "{"
                                            + "\"mensaje\":\"Inicio de sesión correcto\","
                                            + "\"rol\":\"" + rol + "\","
                                            + "\"destino\":\"" + destino + "\""
                                            + "}"
                            );
                        }
                )

                .failureHandler(
                        (request, response, exception) -> {

                            response.setStatus(401);

                            response.setContentType(
                                    "application/json;charset=UTF-8"
                            );

                            response.getWriter().write(
                                    "{"
                                            + "\"mensaje\":\"Correo o contraseña incorrectos, o cuenta inactiva.\""
                                            + "}"
                            );
                        }
                )

                .permitAll()
        );

        return http.build();
    }
}
