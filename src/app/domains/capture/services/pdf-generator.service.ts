import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor() { }

  /**
   * Genera un PDF del expediente capturado
   */
  generarPDFExpediente(datosPaso1: any, datosPaso2: any, datosPaso3: any, expedienteId?: number): void {
    // Crear contenido HTML del reporte
    const contenidoHTML = this.crearContenidoHTML(datosPaso1, datosPaso2, datosPaso3, expedienteId);
    
    // Abrir ventana de impresión
    const ventana = window.open('', '_blank', 'width=800,height=600');
    if (ventana) {
      ventana.document.write(contenidoHTML);
      ventana.document.close();
      
      // Esperar a que cargue y luego imprimir
      ventana.onload = () => {
        ventana.print();
      };
    }
  }

  /**
   * Crea el HTML del reporte
   */
  private crearContenidoHTML(paso1: any, paso2: any, paso3: any, expedienteId?: number): string {
    const fechaGeneracion = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte de Expediente ${paso1.expediente}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; background: #fff; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #691C32; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #691C32; margin-bottom: 10px; }
    .titulo { font-size: 20px; color: #2D2A26; font-weight: bold; }
    .subtitulo { color: #663442; font-size: 14px; }
    
    .seccion { margin: 20px 0; page-break-inside: avoid; }
    .seccion-titulo { background: linear-gradient(135deg, #691C32 0%, #9F2241 100%); color: white; padding: 10px 15px; font-size: 16px; font-weight: bold; border-radius: 5px; margin-bottom: 15px; }
    .campo-grupo { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
    .campo { background: #f8f9fa; padding: 12px; border-radius: 5px; border-left: 3px solid #DDC9A4; }
    .campo-label { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; margin-bottom: 5px; }
    .campo-valor { font-size: 14px; color: #2D2A26; font-weight: 500; }
    .campo-completo { grid-column: 1 / -1; }
    
    .destacado { background: #f0f7ff; border-left-color: #235B4E; }
    .destacado .campo-label { color: #235B4E; }
    
    .urgente { background: #fff5f5; border-left-color: #c53030; }
    .urgente .campo-label { color: #c53030; }
    
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #E2E2E2; text-align: center; color: #666; font-size: 12px; }
    
    @media print {
      body { padding: 10px; }
      .header { page-break-after: avoid; }
      .seccion { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <div class="logo">🏛️ GOBIERNO DE MÉXICO - SAT</div>
    <div class="titulo">SISTEMA TLAPOHUALLI</div>
    <div class="subtitulo">Reporte de Expediente</div>
  </div>

  <!-- INFORMACIÓN GENERAL -->
  <div class="seccion">
    <div class="seccion-titulo">📋 INFORMACIÓN GENERAL</div>
    <div class="campo-grupo">
      <div class="campo destacado">
        <div class="campo-label">Expediente</div>
        <div class="campo-valor">${paso1.expediente || 'N/A'}</div>
      </div>
      <div class="campo destacado">
        <div class="campo-label">Oficio</div>
        <div class="campo-valor">${paso1.oficio || 'N/A'}</div>
      </div>
      <div class="campo">
        <div class="campo-label">No. Entrada Central</div>
        <div class="campo-valor">${paso1.numero_entrada_central || 'N/A'}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Fecha de Generación</div>
        <div class="campo-valor">${fechaGeneracion}</div>
      </div>
      ${expedienteId ? `
      <div class="campo">
        <div class="campo-label">ID en Sistema</div>
        <div class="campo-valor">${expedienteId}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <!-- IDENTIFICACIÓN -->
  <div class="seccion">
    <div class="seccion-titulo">🏢 IDENTIFICACIÓN DEL DOCUMENTO</div>
    <div class="campo-grupo">
      <div class="campo">
        <div class="campo-label">Remitente / Área</div>
        <div class="campo-valor">${paso1.remitente_area || 'N/A'}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Fecha del Documento</div>
        <div class="campo-valor">${this.formatearFecha(paso1.fecha_documento)}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Fecha de Recibido</div>
        <div class="campo-valor">${this.formatearFecha(paso1.fecha_recibido)}</div>
      </div>
      <div class="campo campo-completo">
        <div class="campo-label">Referencia / Asunto</div>
        <div class="campo-valor">${paso1.referencia_asunto || 'N/A'}</div>
      </div>
    </div>
  </div>

  <!-- PLAZOS -->
  <div class="seccion">
    <div class="seccion-titulo">⏱️ PLAZOS Y PRIORIDAD</div>
    <div class="campo-grupo">
      <div class="campo ${paso1.plazo_vencimiento_prioridad?.es_urgente ? 'urgente' : ''}">
        <div class="campo-label">Plazo de Atención</div>
        <div class="campo-valor">
          ${paso1.plazo_vencimiento_prioridad?.valor || '0'} 
          ${this.obtenerTextoUnidad(paso1.plazo_vencimiento_prioridad?.unidad)}
          ${paso1.plazo_vencimiento_prioridad?.es_urgente ? ' ⚠️ URGENTE' : ''}
        </div>
      </div>
      <div class="campo">
        <div class="campo-label">Fecha de Vencimiento</div>
        <div class="campo-valor">${this.formatearFecha(paso2.fecha_vencimiento)}</div>
      </div>
      <div class="campo ${paso2.dias_retraso > 0 ? 'urgente' : ''}">
        <div class="campo-label">Días de Retraso</div>
        <div class="campo-valor">${paso2.dias_retraso || 0} días ${paso2.dias_retraso > 0 ? '⚠️' : '✅'}</div>
      </div>
    </div>
  </div>

  <!-- SEGUIMIENTO -->
  <div class="seccion">
    <div class="seccion-titulo">👤 SEGUIMIENTO Y CONTROL</div>
    <div class="campo-grupo">
      <div class="campo destacado">
        <div class="campo-label">Responsable</div>
        <div class="campo-valor">${paso2.responsable || 'N/A'}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Fecha de Asignación</div>
        <div class="campo-valor">${this.formatearFecha(paso2.fecha_asignacion)}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Sistema / Aplicativo</div>
        <div class="campo-valor">${paso2.sistema_aplicativo || 'No especificado'}</div>
      </div>
      <div class="campo">
        <div class="campo-label">WOOS</div>
        <div class="campo-valor">${paso2.woos || 'N/A'}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Estatus</div>
        <div class="campo-valor">${this.formatearEstatus(paso2.estatus)}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Ubicación</div>
        <div class="campo-valor">${this.formatearUbicacion(paso2.ubicacion)}</div>
      </div>
      ${paso2.oficios_comision ? `
      <div class="campo campo-completo">
        <div class="campo-label">Oficios Comisión / Apoyo / Designación</div>
        <div class="campo-valor">${paso2.oficios_comision}</div>
      </div>
      ` : ''}
      <div class="campo">
        <div class="campo-label">Tipo de Respuesta</div>
        <div class="campo-valor">${this.formatearTipoRespuesta(paso2.tipo_respuesta)}</div>
      </div>
      ${paso2.fecha_notificacion ? `
      <div class="campo">
        <div class="campo-label">Fecha de Notificación</div>
        <div class="campo-valor">${this.formatearFecha(paso2.fecha_notificacion)}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <!-- DOCUMENTACIÓN -->
  <div class="seccion">
    <div class="seccion-titulo">📄 DOCUMENTACIÓN Y CIERRE</div>
    <div class="campo-grupo">
      <div class="campo">
        <div class="campo-label">Tipo de Documento</div>
        <div class="campo-valor">${this.formatearTipoDocumento(paso3.tipo_documento)}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Expediente Físico/Digital</div>
        <div class="campo-valor">${this.formatearExpedienteFisico(paso3.expediente_fisico_digital)}</div>
      </div>
      ${paso3.anexos ? `
      <div class="campo campo-completo">
        <div class="campo-label">Anexos</div>
        <div class="campo-valor">${paso3.anexos}</div>
      </div>
      ` : ''}
      ${paso3.acuse_fisico_digital ? `
      <div class="campo campo-completo">
        <div class="campo-label">Acuse Físico - Digital</div>
        <div class="campo-valor">${paso3.acuse_fisico_digital}</div>
      </div>
      ` : ''}
      ${paso3.comentarios_omega ? `
      <div class="campo campo-completo">
        <div class="campo-label">Comentarios Omega</div>
        <div class="campo-valor">${paso3.comentarios_omega}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div><strong>Sistema Tlapohualli</strong> - Gestión de Expedientes SAT</div>
    <div>Generado: ${fechaGeneracion}</div>
    <div style="margin-top: 10px; font-size: 10px;">
      Este documento es un reporte del sistema y tiene validez oficial
    </div>
  </div>
</body>
</html>
    `;
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha + 'T00:00:00');
      return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return fecha;
    }
  }

  private obtenerTextoUnidad(unidad: string): string {
    const unidades: any = {
      'dias': 'días',
      'horas': 'horas',
      'ambos': 'días/horas'
    };
    return unidades[unidad] || unidad;
  }

  private formatearEstatus(estatus: string): string {
    const estados: any = {
      'EN_TRAMITE': 'En Trámite',
      'ATENDIDO': 'Atendido',
      'PENDIENTE': 'Pendiente',
      'CANCELADO': 'Cancelado'
    };
    return estados[estatus] || estatus;
  }

  private formatearUbicacion(ubicacion: string): string {
    const ubicaciones: any = {
      'CARPETA_GENERAL': 'Carpeta General',
      'CARPETA_INDIVIDUAL': 'Carpeta Individual'
    };
    return ubicaciones[ubicacion] || ubicacion;
  }

  private formatearTipoRespuesta(tipo: string): string {
    const tipos: any = {
      'TOTAL': 'Respuesta Total',
      'PARCIAL': 'Respuesta Parcial',
      'PENDIENTE': 'Pendiente de Respuesta'
    };
    return tipos[tipo] || tipo;
  }

  private formatearTipoDocumento(tipo: string): string {
    const tipos: any = {
      'DICTAMEN': 'Dictamen',
      'REPORTE': 'Reporte',
      'ACTA_HECHOS': 'Acta de Hechos',
      'MEMORIA_TECNICA': 'Memoria Técnica',
      'SIN_INFO': 'Sin Información'
    };
    return tipos[tipo] || tipo;
  }

  private formatearExpedienteFisico(tipo: string): string {
    const tipos: any = {
      'FISICO': 'Solo Físico',
      'DIGITAL': 'Solo Digital',
      'AMBOS': 'Físico y Digital',
      'NINGUNO': 'Ninguno'
    };
    return tipos[tipo] || tipo;
  }
}

