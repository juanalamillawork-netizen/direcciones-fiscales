package com.efisoft.direccionesfiscales.ms_carga_masiva.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "carga_interfaz")
public class CargaInterfaz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "carint_id")
    private Long carintId;

    @Column(name = "carint_num_usuario", nullable = false, length = 20)
    private String carintNumUsuario;

    @Column(name = "rut_id_rutina", nullable = false, length = 50)
    private String rutIdRutina = "MASIVO DIRECCIONES FISCAL";

    @Column(name = "carint_fecha", nullable = false)
    private LocalDateTime carintFecha;

    @Column(name = "carint_sec_archivo", nullable = false)
    private Integer carintSecArchivo = 1;

    @Column(name = "carint_secuencial", nullable = false)
    private Integer carintSecuencial;

    @Column(name = "carint_nom_path", nullable = false, length = 250)
    private String carintNomPath;

    @Column(name = "carint_nom_arch", nullable = false, length = 250)
    private String carintNomArch;

    @Column(name = "carint_arch_tmp", nullable = false, length = 10)
    private String carintArchTmp = "N/A";

    @Column(name = "carint_cadena", nullable = false, columnDefinition = "TEXT")
    private String carintCadena;

    @Column(name = "carint_estatus", nullable = false, length = 1)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.CHAR)
    private String carintEstatus = "A";

    @Column(name = "carint_mensaje", length = 500)
    private String carintMensaje;

    public Long getCarintId() { return carintId; }
    public String getCarintNumUsuario() { return carintNumUsuario; }
    public String getRutIdRutina() { return rutIdRutina; }
    public LocalDateTime getCarintFecha() { return carintFecha; }
    public Integer getCarintSecArchivo() { return carintSecArchivo; }
    public Integer getCarintSecuencial() { return carintSecuencial; }
    public String getCarintNomPath() { return carintNomPath; }
    public String getCarintNomArch() { return carintNomArch; }
    public String getCarintArchTmp() { return carintArchTmp; }
    public String getCarintCadena() { return carintCadena; }
    public String getCarintEstatus() { return carintEstatus; }
    public String getCarintMensaje() { return carintMensaje; }

    public void setCarintNumUsuario(String v) { this.carintNumUsuario = v; }
    public void setCarintFecha(LocalDateTime v) { this.carintFecha = v; }
    public void setCarintSecuencial(Integer v) { this.carintSecuencial = v; }
    public void setCarintNomPath(String v) { this.carintNomPath = v; }
    public void setCarintNomArch(String v) { this.carintNomArch = v; }
    public void setCarintCadena(String v) { this.carintCadena = v; }
    public void setCarintEstatus(String v) { this.carintEstatus = v; }
    public void setCarintMensaje(String v) { this.carintMensaje = v; }
}
