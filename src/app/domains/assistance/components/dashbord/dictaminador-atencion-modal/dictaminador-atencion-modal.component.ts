import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ArchivosAtencionService, ArchivoAdjunto } from '../../../../services/archivos-atencion.service';
import { DictaminadorBandejaService } from '../../../../services/dictaminador-bandeja.service';
import { AsuntoNuevo } from '../../../../interfaces/asuntoPorAtencion.interface';

interface DatosRespuestaFGR {
  folioInterno: string;
  numeroOficio: string;
  fechaAcuseEntrega: string;
  numeroOficioFGRAtiende: string;
  estadoAtencion: 'parcial' | 'total';
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
    imports: [
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
],
    templateUrl: './dictaminador-atencion-modal.component.html',
    styleUrl: './dictaminador-atencion-modal.component.css'
})
export class DictaminadorAtencionModalComponent implements OnInit, OnChanges {
  @Input() mostrarModal = false;
  @Input() asunto: AsuntoDictaminador | null = null;
  @Input() idReq?: number | null;
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() finalizarAtencion = new EventEmitter<string>();

  // Variables para visualización de PDF (YA NO SE USA - SE USA APARTADO DOCUMENTOS)
  // mostrarVisorPDF = false;
  // urlPDFSegura: SafeResourceUrl | null = null;
  // cargandoPDF = false;
  // errorPDF = '';
  // zoomPDF = 100;
  // paginaActualPDF = 1;
  // totalPaginasPDF = 1;

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

  // Datos precargados de Respuesta a FGR
  datosRespuestaFGR: DatosRespuestaFGR | null = null;
  cargandoDatosFGR = false;
  errorDatosFGR = '';

  constructor(
    private domSanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private archivosService: ArchivosAtencionService,
    private dictaminadorService: DictaminadorBandejaService
  ) {}

  ngOnInit(): void {
    // Ya no inicializamos PDF automáticamente - se usa apartado Documentos
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cuando se abre el modal con un asunto, precargar pestaña Documentos
    if ((changes['mostrarModal'] && this.mostrarModal) || changes['asunto']) {
      // Si hay folio, cargar lista y mostrar pestaña documentos
      if (this.obtenerFolio()) {
        this.pestanaActiva = 'documentos';
        this.cargarArchivos();
      }
      // Precargar datos reales de Respuesta a FGR
      this.precargarDatosFGR();
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
    // this.mostrarVisorPDF = false;
    // this.urlPDFSegura = null;
    this.cerrarModal.emit();
  }

  onFinalizarYEnviarRevision(): void {
    if (!this.asunto?.id) {
      this.snackBar.open('No se pudo identificar el asunto a finalizar', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.procesandoFinalizacion = true;
    
    // Usar el mismo endpoint que funciona en dictaminador-detalle
    this.dictaminadorService.finalizarAtencion(Number(this.asunto.id)).subscribe({
      next: (respuesta) => {
        console.log('✅ [Modal] Respuesta del servidor:', respuesta);
        this.procesandoFinalizacion = false;
        
        // La respuesta es texto plano
        if (respuesta && respuesta.includes('fue enviado a revisión')) {
          this.snackBar.open('Asunto enviado a revisión correctamente', 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
        } else {
          this.snackBar.open(respuesta || 'Operación completada', 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
        }
        
        // Emitir evento y cerrar modal
        this.finalizarAtencion.emit(this.asunto!.id);
        this.onCerrarModal();
      },
      error: (error) => {
        console.error('❌ [Modal] Error al finalizar atención:', error);
        this.procesandoFinalizacion = false;

        // Mejorar el manejo de errores
        let mensajeError = 'Error al enviar asunto a revisión';
        
        if (error.error && typeof error.error === 'string') {
          mensajeError += ': ' + error.error;
        } else if (error.message) {
          mensajeError += ': ' + error.message;
        } else if (typeof error === 'string') {
          mensajeError += ': ' + error;
        }

        this.snackBar.open(mensajeError, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // ========== GESTIÓN DE PDF ==========
  
  // YA NO SE USA - PDF se maneja en apartado Documentos
  /*
  prepararPDF(url: string): void {
    if (url) {
      this.urlPDFSegura = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }
  */

  // YA NO SE USA - QUITADO PARA EVITAR ERROR 404
  /*
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
  */

  // YA NO SE USA
  /*
  cerrarVisorPDF(): void {
    this.mostrarVisorPDF = false;
  }
  */

  // MÉTODOS DE CONTROL PDF YA NO SE USAN - SE USA APARTADO DOCUMENTOS
  /*
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
  */

  // ========== UTILIDADES ==========
  
  obtenerIconoEstadoAtencion(): string {
    if (!(this.asunto?.datosRespuestaFGR || this.datosRespuestaFGR)) return 'pending';
    
    const estado = (this.asunto?.datosRespuestaFGR || this.datosRespuestaFGR)!.estadoAtencion;
    switch (estado) {
      case 'total':
        return 'check_circle';
      case 'parcial':
        return 'partial_fulfillment';
      default:
        return 'pending';
    }
  }

  obtenerClaseEstadoAtencion(): string {
    if (!(this.asunto?.datosRespuestaFGR || this.datosRespuestaFGR)) return 'text-gray-500';
    
    const estado = (this.asunto?.datosRespuestaFGR || this.datosRespuestaFGR)!.estadoAtencion;
    switch (estado) {
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

  private obtenerIdReq(): number | null {
    console.log('🔍 [Modal] obtenerIdReq() - idReq recibido:', this.idReq);
    console.log('🔍 [Modal] obtenerIdReq() - asunto:', this.asunto);
    if (this.idReq && this.idReq > 0) return this.idReq;
    const posible = (this.asunto as any)?.id_asignacion || (this.asunto as any)?.idReq || (this.asunto as any)?.ID_REQ;
    console.log('🔍 [Modal] obtenerIdReq() - posible encontrado:', posible);
    return typeof posible === 'number' && posible > 0 ? posible : null;
  }

  private seleccionarUltimaRespuesta(respuestas: AsuntoNuevo[]): AsuntoNuevo {
    const getTs = (a: AsuntoNuevo): number => {
      const fc = a.fecha_captura ? Date.parse(a.fecha_captura as unknown as string) : 0;
      const fa = a.fecha_atencion ? Date.parse(a.fecha_atencion as unknown as string) : 0;
      return Math.max(fc || 0, fa || 0);
    };
    return respuestas.reduce((acc, cur) => {
      const tsAcc = getTs(acc);
      const tsCur = getTs(cur);
      if (tsCur > tsAcc) return cur;
      if (tsCur < tsAcc) return acc;
      return (cur.id_asunto_nuevo ?? 0) > (acc.id_asunto_nuevo ?? 0) ? cur : acc;
    }, respuestas[0]);
  }

  private mapEstadoAtencion(idAtencion?: number | null): 'total' | 'parcial' {
    if (idAtencion === 2) return 'parcial';
    return 'total';
  }

  private extraerNombreArchivo(ruta: string): string {
    if (!ruta) return '';
    const partes = String(ruta).split(/[\\\/]+/);
    return partes[partes.length - 1] || '';
  }

  private precargarDatosFGR(): void {
    const idReq = this.obtenerIdReq();
    console.log('🔍 [Modal] precargarDatosFGR() - idReq final:', idReq);
    if (!idReq) { 
      console.log('❌ [Modal] No se encontró idReq, no se puede precargar datos');
      return; 
    }

    this.cargandoDatosFGR = true;
    this.errorDatosFGR = '';
    console.log('🔍 [Modal] Llamando getRespuestasAsunto con idReq:', idReq, 'documento: RESPUESTA A FGR');

    this.dictaminadorService.getRespuestasAsunto(idReq, 'RESPUESTA A FGR').subscribe({
      next: (respuestas) => {
        console.log('✅ [Modal] Respuestas recibidas:', respuestas);
        this.cargandoDatosFGR = false;
        if (!respuestas || respuestas.length === 0) { 
          console.log('❌ [Modal] No se encontraron respuestas para RESPUESTA A FGR');
          return; 
        }
        const ultima = this.seleccionarUltimaRespuesta(respuestas);
        console.log('🔍 [Modal] Última respuesta seleccionada:', ultima);

        const datos: DatosRespuestaFGR = {
          folioInterno: (ultima as any).folio_interno || String(ultima.folio_scanner || ''),
          numeroOficio: ultima.oficio || '',
          fechaAcuseEntrega: (ultima as any).fecha_acuse_entrega || (ultima as any).fecha_atencion || '',
          numeroOficioFGRAtiende: (ultima as any).oficio_fgr || '',
          estadoAtencion: this.mapEstadoAtencion(ultima.id_atencion_fk),
        };

        console.log('🔍 [Modal] Datos mapeados:', datos);
        this.datosRespuestaFGR = datos;
        if (this.asunto) {
          this.asunto = { ...this.asunto, datosRespuestaFGR: datos };
        }
        console.log('✅ [Modal] datosRespuestaFGR asignado:', this.datosRespuestaFGR);

        // Ya no intentamos cargar PDF aquí - se usa el apartado "Documentos" del modal
      },
      error: (err) => {
        this.cargandoDatosFGR = false;
        this.errorDatosFGR = 'No se pudo precargar la Respuesta a FGR';
        console.error('❌ Error precargando Respuesta a FGR en modal:', err);
      }
    });
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
      estadoAtencion: 'total'
    };
  }
} 