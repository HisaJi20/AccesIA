
package com.accesia.accesia.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "afiliacion_institucional",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_afiliacion_beneficiario_institucion",
        columnNames = {"id_beneficiario", "id_institucion"}
    )
)
public class AfiliacionInstitucional {

    public enum Estado {
        PENDIENTE,
        APROBADA,
        RECHAZADA
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_afiliacion")
    private Long idAfiliacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_beneficiario", nullable = false)
    private Beneficiario beneficiario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_institucion", nullable = false)
    private Institucion institucion;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_afiliacion", nullable = false, length = 20)
    private Estado estado = Estado.PENDIENTE;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDateTime fechaSolicitud = LocalDateTime.now();

    @Column(name = "fecha_decision")
    private LocalDateTime fechaDecision;

    public AfiliacionInstitucional() {}

    public Long getIdAfiliacion() {
        return idAfiliacion;
    }

    public Beneficiario getBeneficiario() {
        return beneficiario;
    }

    public void setBeneficiario(Beneficiario beneficiario) {
        this.beneficiario = beneficiario;
    }

    public Institucion getInstitucion() {
        return institucion;
    }

    public void setInstitucion(Institucion institucion) {
        this.institucion = institucion;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(LocalDateTime fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }

    public LocalDateTime getFechaDecision() {
        return fechaDecision;
    }

    public void setFechaDecision(LocalDateTime fechaDecision) {
        this.fechaDecision = fechaDecision;
    }
}
