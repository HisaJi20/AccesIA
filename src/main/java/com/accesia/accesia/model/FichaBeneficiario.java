
package com.accesia.accesia.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "ficha_beneficiario",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_ficha_institucion_documento",
            columnNames = {
                "id_institucion",
                "tipo_documento",
                "numero_documento"
            }
        )
    }
)
public class FichaBeneficiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ficha")
    private Integer idFicha;

    // Institución propietaria de la ficha
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_institucion", nullable = false)
    private Institucion institucion;

    // Identificación
    @Column(nullable = false, length = 120)
    private String nombres;

    @Column(nullable = false, length = 120)
    private String apellidos;

    @Column(name = "tipo_documento", nullable = false, length = 20)
    private String tipoDocumento;

    @Column(name = "numero_documento", nullable = false, length = 20)
    private String numeroDocumento;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(length = 120)
    private String sede;

    // Condición visual y accesibilidad
    @Column(name = "nivel_discapacidad_visual", length = 60)
    private String nivelDiscapacidadVisual;

    @Column(name = "tecnologia_asistencia", length = 200)
    private String tecnologiaAsistencia;

    @Column(name = "preferencia_comunicacion", length = 60)
    private String preferenciaComunicacion;

    @Column(name = "requiere_lector_pantalla", nullable = false)
    private Boolean requiereLectorPantalla = false;

    @Column(length = 1000)
    private String observaciones;

    // Datos de contacto
    @Column(length = 20)
    private String telefono;

    @Column(length = 120)
    private String email;

    @Column(name = "contacto_emergencia", length = 160)
    private String contactoEmergencia;

    @Column(name = "telefono_emergencia", length = 20)
    private String telefonoEmergencia;

    // Seguimiento institucional
    @Column(nullable = false, length = 30)
    private String estado = "EN_EVALUACION";

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    public void antesDeGuardar() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
    }

    public FichaBeneficiario() {
    }

    public Integer getIdFicha() {
        return idFicha;
    }

    public Institucion getInstitucion() {
        return institucion;
    }

    public void setInstitucion(Institucion institucion) {
        this.institucion = institucion;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(String tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getNumeroDocumento() {
        return numeroDocumento;
    }

    public void setNumeroDocumento(String numeroDocumento) {
        this.numeroDocumento = numeroDocumento;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public String getSede() {
        return sede;
    }

    public void setSede(String sede) {
        this.sede = sede;
    }

    public String getNivelDiscapacidadVisual() {
        return nivelDiscapacidadVisual;
    }

    public void setNivelDiscapacidadVisual(
            String nivelDiscapacidadVisual) {
        this.nivelDiscapacidadVisual =
                nivelDiscapacidadVisual;
    }

    public String getTecnologiaAsistencia() {
        return tecnologiaAsistencia;
    }

    public void setTecnologiaAsistencia(
            String tecnologiaAsistencia) {
        this.tecnologiaAsistencia =
                tecnologiaAsistencia;
    }

    public String getPreferenciaComunicacion() {
        return preferenciaComunicacion;
    }

    public void setPreferenciaComunicacion(
            String preferenciaComunicacion) {
        this.preferenciaComunicacion =
                preferenciaComunicacion;
    }

    public Boolean getRequiereLectorPantalla() {
        return requiereLectorPantalla;
    }

    public void setRequiereLectorPantalla(
            Boolean requiereLectorPantalla) {
        this.requiereLectorPantalla =
                requiereLectorPantalla;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContactoEmergencia() {
        return contactoEmergencia;
    }

    public void setContactoEmergencia(
            String contactoEmergencia) {
        this.contactoEmergencia =
                contactoEmergencia;
    }

    public String getTelefonoEmergencia() {
        return telefonoEmergencia;
    }

    public void setTelefonoEmergencia(
            String telefonoEmergencia) {
        this.telefonoEmergencia =
                telefonoEmergencia;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }
}
