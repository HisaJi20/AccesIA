package com.accesia.accesia.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "beneficiario")
@DiscriminatorValue("BENEFICIARIO")
@PrimaryKeyJoinColumn(name = "id_beneficiario")
public class Beneficiario extends Usuario {

    @Column(nullable = false)
    private String nombres;

    @Column(nullable = false)
    private String apellidos;

    @Column(name = "tipo_documento")
    private String tipoDocumento;

    @Column(name = "numero_documento", unique = true)
    private String numeroDocumento;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    private String telefono;

    @Column(name = "nivel_discapacidad_visual")
    private String nivelDiscapacidadVisual;

    @Column(name = "preferencia_comunicacion")
    private String preferenciaComunicacion;

    @Column(name = "requiere_lector_pantalla")
    private Boolean requiereLectorPantalla = false;

    public Beneficiario() {
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

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getNivelDiscapacidadVisual() {
        return nivelDiscapacidadVisual;
    }

    public void setNivelDiscapacidadVisual(String nivelDiscapacidadVisual) {
        this.nivelDiscapacidadVisual = nivelDiscapacidadVisual;
    }

    public String getPreferenciaComunicacion() {
        return preferenciaComunicacion;
    }

    public void setPreferenciaComunicacion(String preferenciaComunicacion) {
        this.preferenciaComunicacion = preferenciaComunicacion;
    }

    public Boolean getRequiereLectorPantalla() {
        return requiereLectorPantalla;
    }

    public void setRequiereLectorPantalla(Boolean requiereLectorPantalla) {
        this.requiereLectorPantalla = requiereLectorPantalla;
    }
}