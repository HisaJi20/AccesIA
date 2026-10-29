package com.accesia.accesia.model;

import jakarta.persistence.*;

@Entity
@Table(name = "plan")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_plan")
    private Integer idPlan;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(name = "precio_mensual", nullable = false)
    private Double precioMensual;

    @Column(name = "limite_beneficiarios")
    private Integer limiteBeneficiarios;

    @Column(name = "limite_personal")
    private Integer limitePersonal;

    @Column(name = "limite_servicios")
    private Integer limiteServicios;

    @Column(name = "estado_plan")
    private String estadoPlan = "ACTIVO";

    public Plan() {
    }

    public Integer getIdPlan() {
        return idPlan;
    }

    public void setIdPlan(Integer idPlan) {
        this.idPlan = idPlan;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Double getPrecioMensual() {
        return precioMensual;
    }

    public void setPrecioMensual(Double precioMensual) {
        this.precioMensual = precioMensual;
    }

    public Integer getLimiteBeneficiarios() {
        return limiteBeneficiarios;
    }

    public void setLimiteBeneficiarios(Integer limiteBeneficiarios) {
        this.limiteBeneficiarios = limiteBeneficiarios;
    }

    public Integer getLimitePersonal() {
        return limitePersonal;
    }

    public void setLimitePersonal(Integer limitePersonal) {
        this.limitePersonal = limitePersonal;
    }

    public Integer getLimiteServicios() {
        return limiteServicios;
    }

    public void setLimiteServicios(Integer limiteServicios) {
        this.limiteServicios = limiteServicios;
    }

    public String getEstadoPlan() {
        return estadoPlan;
    }

    public void setEstadoPlan(String estadoPlan) {
        this.estadoPlan = estadoPlan;
    }
}