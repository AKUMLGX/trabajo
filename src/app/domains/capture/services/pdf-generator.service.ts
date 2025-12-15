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
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      padding: 30px; 
      background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
      color: #2D2A26;
    }
    
    /* HEADER PREMIUM - PALETA INSTITUCIONAL SAT */
    .header { 
      background: linear-gradient(145deg, #34005b 0%, #3e0065 50%, #5c1a7a 100%);
      padding: 35px;
      border-radius: 18px 18px 0 0;
      color: white;
      box-shadow: 0 10px 40px rgba(52, 0, 91, 0.35);
      margin: -30px -30px 30px -30px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(214, 174, 103, 0.2) 0%, transparent 70%);
      border-radius: 50%;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #d6ae67, #dbb872, #f0d78c, #dbb872, #d6ae67);
    }
    .header-content { 
      position: relative; 
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-left { flex: 1; }
    .logo-container {
      background: linear-gradient(145deg, #ffffff, #f8f5f0);
      border-radius: 14px;
      padding: 18px;
      display: inline-block;
      margin-bottom: 18px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.12);
      border: 2px solid rgba(214, 174, 103, 0.3);
    }
    .logo { 
      font-size: 26px; 
      font-weight: 900; 
      background: linear-gradient(145deg, #34005b 0%, #3e0065 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .titulo { 
      font-size: 34px; 
      font-weight: 900; 
      text-shadow: 2px 2px 6px rgba(0,0,0,0.3);
      margin-bottom: 3px;
      letter-spacing: 0.5px;
    }
    .subtitulo { 
      font-size: 20px; 
      color: rgba(214, 174, 103, 0.95);
      font-weight: 600;
      letter-spacing: 1px;
    }
    .header-right {
      text-align: right;
      background: linear-gradient(145deg, rgba(214, 174, 103, 0.2), rgba(214, 174, 103, 0.1));
      padding: 22px;
      border-radius: 14px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(214, 174, 103, 0.3);
    }
    .expediente-numero {
      font-size: 26px;
      font-weight: 900;
      margin-bottom: 6px;
      color: #d6ae67;
    }
    .fecha-generacion {
      font-size: 12px;
      opacity: 0.85;
      color: rgba(255,255,255,0.9);
    }
    
    /* SECCIONES MEJORADAS */
    .seccion { 
      margin: 30px 0; 
      page-break-inside: avoid;
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }
    .seccion-titulo { 
      background: linear-gradient(145deg, #34005b 0%, #3e0065 100%);
      color: white; 
      padding: 16px 22px; 
      font-size: 18px; 
      font-weight: 800; 
      border-radius: 12px;
      margin: -25px -25px 22px -25px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 6px 18px rgba(52, 0, 91, 0.25);
    }
    .seccion-icon {
      font-size: 24px;
    }
    
    /* CAMPOS PREMIUM */
    .campo-grupo { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 18px; 
    }
    .campo { 
      background: linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%);
      padding: 18px; 
      border-radius: 12px; 
      border-left: 4px solid #d6ae67;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(52, 0, 91, 0.05);
    }
    .campo:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .campo-label { 
      font-size: 10px; 
      text-transform: uppercase; 
      color: #888; 
      font-weight: 700; 
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }
    .campo-valor { 
      font-size: 15px; 
      color: #2D2A26; 
      font-weight: 600;
      word-break: break-word;
    }
    .campo-completo { grid-column: 1 / -1; }
    
    /* ESTILOS DESTACADOS */
    .destacado { 
      background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
      border-left-color: #1890ff;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
    }
    .destacado .campo-label { color: #0050b3; }
    .destacado .campo-valor { color: #003a8c; font-weight: 700; }
    
    .urgente { 
      background: linear-gradient(135deg, #fff5f5 0%, #ffe4e6 100%);
      border-left-color: #dc2626;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
      animation: pulse 2s ease-in-out infinite;
    }
    .urgente .campo-label { color: #991b1b; }
    .urgente .campo-valor { color: #7f1d1d; font-weight: 700; }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    
    .exito {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-left-color: #16a34a;
      box-shadow: 0 2px 8px rgba(22, 163, 74, 0.15);
    }
    .exito .campo-label { color: #166534; }
    .exito .campo-valor { color: #14532d; font-weight: 700; }
    
    /* FOOTER PREMIUM */
    .footer { 
      margin-top: 50px; 
      padding: 35px;
      background: linear-gradient(145deg, #f8f7f4 0%, #ebe8e1 100%);
      border-radius: 0 0 18px 18px;
      text-align: center; 
      color: #555; 
      font-size: 12px;
      box-shadow: 0 -6px 20px rgba(52, 0, 91, 0.06);
      border-top: 3px solid #d6ae67;
    }
    .footer-logo {
      font-weight: 900;
      font-size: 18px;
      color: #34005b;
      margin-bottom: 12px;
    }
    .footer-info {
      margin: 8px 0;
      color: #555;
    }
    .footer-sello {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid #ddd;
      font-size: 10px;
      color: #888;
      font-style: italic;
    }
    
    /* BADGES Y ETIQUETAS */
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-left: 8px;
    }
    .badge-urgente {
      background: #dc2626;
      color: white;
      animation: blink 1s ease-in-out infinite;
    }
    .badge-ok {
      background: #16a34a;
      color: white;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    @media print {
      body { padding: 15px; background: white; }
      .header { page-break-after: avoid; margin: -15px -15px 20px -15px; }
      .seccion { page-break-inside: avoid; box-shadow: none; }
      .campo:hover { transform: none; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
    }
  </style>
</head>
<body>
  <!-- HEADER PREMIUM -->
  <div class="header">
    <div class="header-content">
      <div class="header-left">
        <div class="logo-container">
          <div class="logo">🏛️ TLÁLCALLI</div>
        </div>
        <div class="titulo">TLÁLCALLI</div>
        <div class="subtitulo">CONTROL DE EXPEDIENTES</div>
      </div>
      <div class="header-right">
        <div class="expediente-numero">${paso1.expediente}</div>
        <div class="fecha-generacion">Generado: ${fechaGeneracion}</div>
      </div>
    </div>
  </div>

  <!-- INFORMACIÓN GENERAL -->
  <div class="seccion">
    <div class="seccion-titulo"><span class="seccion-icon">📋</span> INFORMACIÓN GENERAL</div>
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
    <div class="seccion-titulo"><span class="seccion-icon">🏢</span> IDENTIFICACIÓN DEL DOCUMENTO</div>
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

  <!-- SEGUIMIENTO -->
  <div class="seccion">
    <div class="seccion-titulo"><span class="seccion-icon">👤</span> SEGUIMIENTO Y CONTROL</div>
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
        <div class="campo-label">Estatus</div>
        <div class="campo-valor">${this.formatearEstatus(paso2.estatus)}</div>
      </div>
      <div class="campo">
        <div class="campo-label">Ubicación</div>
        <div class="campo-valor">${this.formatearUbicacion(paso2.ubicacion)}</div>
      </div>
    </div>
  </div>

  <!-- DOCUMENTACIÓN -->
  <div class="seccion">
    <div class="seccion-titulo"><span class="seccion-icon">📄</span> DOCUMENTACIÓN Y CIERRE</div>
    <div class="campo-grupo">
      <div class="campo campo-completo">
        <div class="campo-label">Documento PDF principal</div>
        <div class="campo-valor">${paso3.documento_pdf_nombre || 'No adjuntado'}</div>
      </div>
      ${(paso3.campos_documentos_pospuestos && paso3.campos_documentos_pospuestos.length) ? `
      <div class="campo campo-completo">
        <div class="campo-label">Campos documentales pendientes</div>
        <div class="campo-valor">${paso3.campos_documentos_pospuestos.join(', ')}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <!-- FOOTER REMOVIDO -->
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
      'ASIGNADO': 'Asignado',
      'PENDIENTE': 'Pendiente',
      'ATENCION_PARCIAL': 'Atención parcial',
      'ATENCION_TOTAL': 'Atención total',
      'REVISION_LEGAL': 'Revisión legal'
    };
    return estados[estatus] || estatus;
  }

  private formatearUbicacion(ubicacion: string): string {
    const ubicaciones: any = {
      'CARPETA_GENERAL_I': 'Carpeta General I',
      'CARPETA_GENERAL_II': 'Carpeta General II',
      'CARPETA_GENERAL_III': 'Carpeta General III',
      'CARPETA_GENERAL_IV': 'Carpeta General IV',
      'CARPETA_GENERAL_V': 'Carpeta General V',
      '': 'N/A',
      null: 'N/A',
      undefined: 'N/A'
    };
    return ubicaciones.hasOwnProperty(ubicacion) ? ubicaciones[ubicacion] : ubicacion || 'N/A';
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

