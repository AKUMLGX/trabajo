import { Component, Inject, OnInit } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExpedienteTlalcalli } from '../../../../domains/capture/interfaces/expediente-tlalcalli.interface';
import { FileService } from '../../../../domains/services/file.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
    selector: 'app-expediente-detalle-modal',
    imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    PdfViewerModule
],
    templateUrl: './expediente-detalle-modal.component.html',
    styleUrl: './expediente-detalle-modal.component.css'
})
export class ExpedienteDetalleModalComponent implements OnInit {
  expediente: ExpedienteTlalcalli;
  pdfUrl: string = '';
  mostrarPdf: boolean = false;
  nombrePdfPrincipal: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<ExpedienteDetalleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expediente: ExpedienteTlalcalli },
    private fileService: FileService
  ) {
    this.expediente = data.expediente;
    console.log('📋 [ExpedienteDetalleModal] Expediente recibido:', this.expediente);
    console.log('📄 [ExpedienteDetalleModal] documento_pdf_nombre:', this.expediente.documento_pdf_nombre);
    // Extraer el nombre del PDF principal del campo documento_pdf_nombre
    this.extraerNombrePdfPrincipal();
  }

  ngOnInit(): void {
    // Configurar el worker de PDF.js para el modal también (usando archivo local)
    try {
      const workerPath = '/akamba/assets/pdfjs/pdf.worker.min.js';
      
      // Configurar para ng2-pdf-viewer
      (window as any).PDFJS = (window as any).PDFJS || {};
      (window as any).PDFJS.workerSrc = workerPath;
      (window as any).pdfjsWorker = workerPath;
      
      console.log('✅ [ExpedienteDetalleModal] Worker de PDF.js configurado localmente:', workerPath);
    } catch (error) {
      console.warn('⚠️ [ExpedienteDetalleModal] No se pudo configurar el worker:', error);
      // Fallback a CDN si el local falla
      const pdfjsVersion = '4.8.69';
      (window as any).PDFJS = (window as any).PDFJS || {};
      (window as any).PDFJS.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/legacy/build/pdf.worker.min.js`;
      console.log('⚠️ [ExpedienteDetalleModal] Usando CDN como fallback');
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  /**
   * Formatear fecha que viene como string del backend (YYYY-MM-DD) a DD/MM/YYYY
   * También maneja NaiveDate de Rust que viene como string
   */
  formatearFecha(fecha: string | Date | null | undefined): string {
    if (!fecha) return 'N/A';
    
    // Si ya es un Date, formatearlo
    if (fecha instanceof Date) {
      return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    
    // Si es string (formato YYYY-MM-DD del backend)
    if (typeof fecha === 'string') {
      // Manejar formato con hora si viene (YYYY-MM-DD HH:MM:SS)
      const fechaSinHora = fecha.split(' ')[0];
      const partes = fechaSinHora.split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return fecha;
    }
    
    return 'N/A';
  }

  /**
   * Formatear tipo de medio de recepción para mostrar
   */
  formatearTipoMedioRecepcion(tipo: string | null | undefined): string {
    if (!tipo) return 'N/A';
    
    const tipos: { [key: string]: string } = {
      'ATENTA_NOTA': 'Atenta Nota',
      'OFICIO': 'Oficio',
      'REQUERIMIENTO_VERBAL': 'Petición interna',
      'CORREO_ELECTRONICO': 'Correo Electrónico'
    };
    
    return tipos[tipo] || tipo;
  }

  /**
   * Formatear estatus para mostrar
   */
  formatearEstatus(estatus: string | undefined): string {
    if (!estatus) return 'N/A';
    
    const estatusMap: { [key: string]: string } = {
      'ASIGNADO': 'Asignado',
      'PENDIENTE': 'Pendiente',
      'ATENCION_PARCIAL': 'Atención parcial',
      'ATENCION_TOTAL': 'Atención total',
      'REVISION_LEGAL': 'Revisión legal'
    };
    
    return estatusMap[estatus] || estatus;
  }

  /**
   * Formatear ubicación para mostrar
   */
  formatearUbicacion(ubicacion: string | undefined): string {
    if (!ubicacion) return 'N/A';
    
    const ubicaciones: { [key: string]: string } = {
      'CARPETA_GENERAL': 'Carpeta General',
      'CARPETA_INDIVIDUAL': 'Carpeta Individual'
    };
    
    return ubicaciones[ubicacion] || ubicacion;
  }

  /**
   * Formatear tipo de respuesta para mostrar
   */
  formatearTipoRespuesta(tipo: string | undefined): string {
    if (!tipo) return 'N/A';
    
    const tipos: { [key: string]: string } = {
      'TOTAL': 'Total',
      'PARCIAL': 'Parcial',
      'PENDIENTE': 'Pendiente'
    };
    
    return tipos[tipo] || tipo;
  }

  /**
   * Formatear tipo de documento para mostrar
   */
  formatearTipoDocumento(tipo: string | undefined): string {
    if (!tipo) return 'N/A';
    
    const tipos: { [key: string]: string } = {
      'DICTAMEN': 'Dictamen',
      'REPORTE': 'Reporte',
      'ACTA_HECHOS': 'Acta de Hechos',
      'MEMORIA_TECNICA': 'Memoria Técnica',
      'SIN_INFO': 'Sin Información'
    };
    
    return tipos[tipo] || tipo;
  }

  /**
   * Formatear expediente físico/digital para mostrar
   */
  formatearExpedienteFisicoDigital(tipo: string | undefined): string {
    if (!tipo) return 'N/A';
    
    const tipos: { [key: string]: string } = {
      'FISICO': 'Físico',
      'DIGITAL': 'Digital',
      'AMBOS': 'Ambos',
      'NINGUNO': 'Ninguno'
    };
    
    return tipos[tipo] || tipo;
  }

  /**
   * Formatear plazo unidad para mostrar
   */
  formatearPlazoUnidad(unidad: string | undefined): string {
    if (!unidad) return 'N/A';
    
    const unidades: { [key: string]: string } = {
      'dias': 'Días',
      'horas': 'Horas',
      'ambos': 'Días y Horas'
    };
    
    return unidades[unidad] || unidad;
  }

  /**
   * Obtener clase CSS para días de retraso
   */
  getClaseDiasRetraso(dias: number | null | undefined): string {
    if (dias === null || dias === undefined) return '';
    if (dias > 0) return 'text-red-600 font-semibold';
    if (dias === 0) return 'text-green-600';
    return 'text-blue-600';
  }

  /**
   * Obtener texto para días de retraso
   */
  getTextoDiasRetraso(dias: number | null | undefined): string {
    if (dias === null || dias === undefined) return 'N/A';
    if (dias > 0) return `${dias} días de retraso`;
    if (dias === 0) return 'Al día';
    return `${Math.abs(dias)} días restantes`;
  }

  /**
   * Extraer el nombre del PDF principal del campo documento_pdf_nombre
   */
  extraerNombrePdfPrincipal(): void {
    if (this.expediente.documento_pdf_nombre) {
      this.nombrePdfPrincipal = this.expediente.documento_pdf_nombre;
      console.log('✅ [ExpedienteDetalleModal] Nombre PDF extraído:', this.nombrePdfPrincipal);
    } else {
      console.warn('⚠️ [ExpedienteDetalleModal] No hay documento_pdf_nombre en el expediente');
      this.nombrePdfPrincipal = null;
    }
  }

  /**
   * Ver el PDF del expediente
   */
  verPdf(): void {
    if (!this.expediente.oficio || !this.nombrePdfPrincipal) {
      console.error('❌ [ExpedienteDetalleModal] No se puede ver el PDF: falta oficio o nombre del archivo');
      console.error('   - oficio:', this.expediente.oficio);
      console.error('   - nombrePdfPrincipal:', this.nombrePdfPrincipal);
      return;
    }

    console.log('📄 [ExpedienteDetalleModal] Iniciando visualización de PDF:', {
      oficio: this.expediente.oficio,
      nombrePdf: this.nombrePdfPrincipal
    });

    // Limpiar URL anterior si existe
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = '';
    }

    // Suscribirse al evento de actualización del PDF (solo una vez)
    const subscription = this.fileService.pdfUpdated.subscribe((pdfBase64: string) => {
      console.log('✅ [ExpedienteDetalleModal] PDF recibido, procesando...');
      try {
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        this.pdfUrl = URL.createObjectURL(blob);
        this.mostrarPdf = true;
        console.log('✅ [ExpedienteDetalleModal] PDF procesado y mostrado');
        console.log('   - pdfUrl:', this.pdfUrl);
        console.log('   - blob size:', blob.size, 'bytes');
        console.log('   - mostrarPdf:', this.mostrarPdf);
        subscription.unsubscribe(); // Desuscribirse después de recibir el PDF
      } catch (error) {
        console.error('❌ [ExpedienteDetalleModal] Error al procesar PDF:', error);
        subscription.unsubscribe();
      }
    });

    // Obtener el PDF del servidor
    // Usar el oficio como identificador (similar a folio_interno en Akamba)
    this.fileService.updatePdfFile(this.expediente.oficio, this.nombrePdfPrincipal);
  }

  /**
   * Cerrar la visualización del PDF
   */
  cerrarPdf(): void {
    this.mostrarPdf = false;
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = '';
    }
  }

  /**
   * Verificar si hay PDF disponible
   */
  tienePdf(): boolean {
    const tiene = this.nombrePdfPrincipal !== null && this.expediente.oficio !== undefined;
    console.log('🔍 [ExpedienteDetalleModal] tienePdf():', tiene, {
      nombrePdfPrincipal: this.nombrePdfPrincipal,
      oficio: this.expediente.oficio
    });
    return tiene;
  }

  /**
   * Descargar el PDF del expediente
   */
  descargarPdf(): void {
    if (!this.expediente.oficio || !this.nombrePdfPrincipal) {
      console.error('❌ No se puede descargar el PDF: falta oficio o nombre del archivo');
      return;
    }

    this.fileService.downloadPdfFileBandejaAtencion(
      this.expediente.oficio,
      this.nombrePdfPrincipal,
      this.nombrePdfPrincipal
    );
  }

  /**
   * Imprimir el PDF del expediente
   */
  imprimirPdf(): void {
    if (!this.expediente.oficio || !this.nombrePdfPrincipal) {
      console.error('❌ No se puede imprimir el PDF: falta oficio o nombre del archivo');
      return;
    }

    this.fileService.printPdf(this.expediente.oficio, this.nombrePdfPrincipal);
  }
}

