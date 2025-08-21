import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ArchivosAtencionService, ArchivoAdjunto } from '../../../../services/archivos-atencion.service';

interface DatosRespuestaFGR {
  folioInterno: string;
  numeroOficio: string;
  fechaAcuseEntrega: string;
  numeroOficioFGRAtiende: string;
  estadoAtencion: 'parcial' | 'total';
  descripcionRespuesta: string;
  archivoPDF?: File;
  urlPDF?: string;
}

interface AsuntoDictaminador {
  id: string;
  folio: string;
  personaRelacionada: string;
  carpetaInvestigacion: string;
  estadoAtencion: string;
  fechaRecepcion: Date;
  diasTranscurridos: number;
  plazoUrgente: boolean;
  // Datos del expediente (respuesta a FGR)
  datosRespuestaFGR?: DatosRespuestaFGR;
}

@Component({
  selector: 'app-dictaminador-atencion-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './dictaminador-atencion-modal.component.html',
  styleUrl: './dictaminador-atencion-modal.component.css'
})
export class DictaminadorAtencionModalComponent implements OnInit {
  @Input() mostrarModal = false;
  @Input() asunto: AsuntoDictaminador | null = null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() finalizarAtencion = new EventEmitter<string>();

  // Variables para visualización de PDF
  mostrarVisorPDF = false;
  urlPDFSegura: SafeResourceUrl | null = null;
  cargandoPDF = false;
  errorPDF = '';
  zoomPDF = 100;
  paginaActualPDF = 1;
  totalPaginasPDF = 1;

  // ==== Integración de documentos (endpoints) ====
  pestanaActiva: 'detalles' | 'documentos' = 'detalles';
  archivos: ArchivoAdjunto[] = [];
  cargandoArchivos = false;
  pdfActual: ArchivoAdjunto | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  pdfCargando = false;
  pdfError = false;
  private origenArchivos: 'raiz' | 'atencion' = 'raiz';

  // Estado del modal
  procesandoFinalizacion = false;

  constructor(
    private domSanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private archivosService: ArchivosAtencionService
  ) {}

  ngOnInit(): void {
    // Inicializar datos si existen
    if (this.asunto?.datosRespuestaFGR?.urlPDF) {
      this.prepararPDF(this.asunto.datosRespuestaFGR.urlPDF);
    }
  }

  // Cambio de pestaña
  cambiarPestana(pestana: 'detalles' | 'documentos'): void {
    this.pestanaActiva = pestana;
    if (pestana === 'documentos' && this.archivos.length === 0 && !this.cargandoArchivos) {
      this.cargarArchivos();
    }
  }

  // ========== GESTIÓN DEL MODAL ==========
  
  onCerrarModal(): void {
    this.mostrarVisorPDF = false;
    this.urlPDFSegura = null;
    this.cerrarModal.emit();
  }

  onFinalizarYEnviarRevision(): void {
    if (!this.asunto) return;

    this.procesandoFinalizacion = true;
    
    // Simular proceso de finalización
    setTimeout(() => {
      this.procesandoFinalizacion = false;
      this.finalizarAtencion.emit(this.asunto!.id);
      
      this.snackBar.open(
        `Asunto ${this.asunto!.folio} enviado a revisión exitosamente`,
        'Cerrar',
        {
          duration: 4000,
          panelClass: ['success-snackbar']
        }
      );
      
      this.onCerrarModal();
    }, 2000);
  }

  // ========== GESTIÓN DE PDF ==========
  
  prepararPDF(url: string): void {
    if (url) {
      this.urlPDFSegura = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  abrirVisorPDF(): void {
    if (this.asunto?.datosRespuestaFGR?.urlPDF) {
      this.mostrarVisorPDF = true;
      this.cargandoPDF = true;
      this.errorPDF = '';
      
      // Simular carga de PDF
      setTimeout(() => {
        this.cargandoPDF = false;
      }, 1000);
    } else {
      this.snackBar.open('No hay documento PDF disponible', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  cerrarVisorPDF(): void {
    this.mostrarVisorPDF = false;
  }

  // Control de zoom del PDF
  aumentarZoom(): void {
    if (this.zoomPDF < 200) {
      this.zoomPDF += 25;
    }
  }

  disminuirZoom(): void {
    if (this.zoomPDF > 50) {
      this.zoomPDF -= 25;
    }
  }

  ajustarPantalla(): void {
    this.zoomPDF = 100;
  }

  // Control de páginas del PDF
  paginaAnterior(): void {
    if (this.paginaActualPDF > 1) {
      this.paginaActualPDF--;
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActualPDF < this.totalPaginasPDF) {
      this.paginaActualPDF++;
    }
  }

  // ========== UTILIDADES ==========
  
  obtenerIconoEstadoAtencion(): string {
    if (!this.asunto?.datosRespuestaFGR) return 'pending';
    
    switch (this.asunto.datosRespuestaFGR.estadoAtencion) {
      case 'total':
        return 'check_circle';
      case 'parcial':
        return 'partial_fulfillment';
      default:
        return 'pending';
    }
  }

  obtenerClaseEstadoAtencion(): string {
    if (!this.asunto?.datosRespuestaFGR) return 'text-gray-500';
    
    switch (this.asunto.datosRespuestaFGR.estadoAtencion) {
      case 'total':
        return 'text-green-600';
      case 'parcial':
        return 'text-orange-600';
      default:
        return 'text-gray-500';
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No registrada';
    
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  // ========== DOCUMENTOS (lista y visor) ==========
  private obtenerFolio(): string | null {
    return this.asunto?.folio || null;
  }

  cargarArchivos(): void {
    const folio = this.obtenerFolio();
    if (!folio) { return; }

    this.cargandoArchivos = true;
    this.archivos = [];

    // Intento 1: endpoint de carpeta raíz (modal guinda)
    this.archivosService.listarArchivosPdfAtencion(folio).subscribe({
      next: (archs) => {
        if (archs && archs.length > 0) {
          this.archivos = archs;
          this.origenArchivos = 'raiz';
          this.cargandoArchivos = false;
        } else {
          // Fallback: carpeta 'atencion'
          this.archivosService.listarArchivosPdf(folio).subscribe({
            next: (archs2) => {
              this.archivos = archs2 || [];
              this.origenArchivos = this.archivos.length > 0 ? 'atencion' : 'raiz';
              this.cargandoArchivos = false;
            },
            error: () => { this.cargandoArchivos = false; }
          });
        }
      },
      error: () => {
        // Si falla raíz, probar 'atencion'
        this.archivosService.listarArchivosPdf(folio).subscribe({
          next: (archs2) => {
            this.archivos = archs2 || [];
            this.origenArchivos = this.archivos.length > 0 ? 'atencion' : 'raiz';
            this.cargandoArchivos = false;
          },
          error: () => { this.cargandoArchivos = false; }
        });
      }
    });
  }

  recargarArchivos(): void {
    this.cargarArchivos();
  }

  seleccionarArchivo(archivo: ArchivoAdjunto): void {
    const folio = this.obtenerFolio();
    if (!folio) { return; }

    this.pdfActual = archivo;
    this.pdfCargando = true;
    this.pdfError = false;
    this.pdfUrl = null;

    // Normalizar nombres tipo nombre_1234567890.pdf o nombre.pdf-123
    let nombre = archivo.nombre;
    const matchUnderscore = nombre.match(/^(.+)_\d{10}(\.[^.]+)$/);
    if (matchUnderscore) { nombre = matchUnderscore[1] + matchUnderscore[2]; }
    const matchDashAfterExt = nombre.match(/(.+\.pdf)-\d+$/);
    if (matchDashAfterExt && matchDashAfterExt[1]) { nombre = matchDashAfterExt[1]; }

    const obs = this.origenArchivos === 'atencion'
      ? this.archivosService.obtenerPdf(folio, nombre, 'atencion')
      : this.archivosService.obtenerPdf(folio, nombre);

    obs.subscribe({
      next: (data: string) => {
        try {
          const src = `data:application/pdf;base64,${data}`;
          this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(src);
          this.pdfCargando = false;
        } catch {
          this.pdfError = true; this.pdfCargando = false;
        }
      },
      error: () => { this.pdfError = true; this.pdfCargando = false; }
    });
  }

  // Datos de ejemplo para demostración
  obtenerDatosEjemplo(): DatosRespuestaFGR {
    return {
      folioInterno: 'FGR-2025-001',
      numeroOficio: 'SAT/FGR/001/2025',
      fechaAcuseEntrega: '2025-01-28',
      numeroOficioFGRAtiende: 'FGR/UEAF/456/2025',
      estadoAtencion: 'total',
      descripcionRespuesta: 'Se atiende en su totalidad el requerimiento de información fiscal solicitado por la FGR, proporcionando todos los documentos y datos requeridos para el expediente de investigación.',
      urlPDF: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    };
  }
} 