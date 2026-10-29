package com.accesia.accesia.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitud")
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Integer idSolicitud;

    @ManyToOne
    @JoinColumn(name = "id_beneficiario", nullable = false)
    private Beneficiario beneficiario;

    @ManyToOne
    @JoinColumn(name = "id_servicio", nullable = false)
    private Servicio servicio;

    @Column(name = "fecha_solicitud")
    private LocalDateTime fechaSolicitud = LocalDateTime.now();

    @Column(name = "descripcion_necesidad", columnDefinition = "TEXT", nullable = false)
    private String descripcionNecesidad;

    private String prioridad = "MEDIA";

    @Column(name = "modalidad_solicitada")
    private String modalidadSolicitada;

    @Column(name = "fecha_preferida")
    private LocalDate fechaPreferida;

    @Column(name = "horario_preferido")
    private String horarioPreferido;

    @Column(name = "adaptaciones_requeridas", columnDefinition = "TEXT")
    private String adaptacionesRequeridas;

    @Column(name = "estado_solicitud")
    private String estadoSolicitud = "PENDIENTE";

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    public Solicitud() {
    }

    public Integer getIdSolicitud() {
        return idSolicitud;
    }

    public void setIdSolicitud(Integer idSolicitud) {
        this.idSolicitud = idSolicitud;
    }

    public Beneficiario getBeneficiario() {
        return beneficiario;
    }

    public void setBeneficiario(Beneficiario beneficiario) {
        this.beneficiario = beneficiario;
    }

    public Servicio getServicio() {
        return servicio;
    }

    public void setServicio(Servicio servicio) {
        this.servicio = servicio;
    }

    public LocalDateTime getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(LocalDateTime fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }

    public String getDescripcionNecesidad() {
        return descripcionNecesidad;
    }

    public void setDescripcionNecesidad(String descripcionNecesidad) {
        this.descripcionNecesidad = descripcionNecesidad;
    }

    public String getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(String prioridad) {
        this.prioridad = prioridad;
    }

    public String getModalidadSolicitada() {
        return modalidadSolicitada;
    }

    public void setModalidadSolicitada(String modalidadSolicitada) {
        this.modalidadSolicitada = modalidadSolicitada;
    }

    public LocalDate getFechaPreferida() {
        return fechaPreferida;
    }

    public void setFechaPreferida(LocalDate fechaPreferida) {
        this.fechaPreferida = fechaPreferida;
    }

    public String getHorarioPreferido() {
        return horarioPreferido;
    }

    public void setHorarioPreferido(String horarioPreferido) {
        this.horarioPreferido = horarioPreferido;
    }

    public String getAdaptacionesRequeridas() {
        return adaptacionesRequeridas;
    }

    public void setAdaptacionesRequeridas(String adaptacionesRequeridas) {
        this.adaptacionesRequeridas = adaptacionesRequeridas;
    }

    public String getEstadoSolicitud() {
        return estadoSolicitud;
    }

    public void setEstadoSolicitud(String estadoSolicitud) {
        this.estadoSolicitud = estadoSolicitud;
    }

    public LocalDateTime getFechaCierre() {
        return fechaCierre;
    }

    public void setFechaCierre(LocalDateTime fechaCierre) {
        this.fechaCierre = fechaCierre;
    }
}