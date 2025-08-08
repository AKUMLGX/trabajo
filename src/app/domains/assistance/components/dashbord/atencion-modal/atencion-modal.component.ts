import { Component, ElementRef, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AsuntoService } from '../../../../../domains/services/asunto.service';
import { ArchivosAtencionService, ArchivoAdjunto } from '../../../../../domains/services/archivos-atencion.service';
import { environment } from '../../../../../../environments/environment';
import { CommonModule } from '@angular/common';

// Interfaces
interface ArchivoAtencion {
  id?: number;
  nombre: string;
  ruta_completa?: string;
  tamano: string;
  ultima_modificacion?: string;
}

interface AsuntoPorAtencion {
  id_asunto?: number;
  folio_interno?: string;
  autoridad_remitente?: string;
  persona_relacionada?: string;
  fecha_recepcion?: string;
  carpeta_investigacion?: string;
  oficio?: string;
  turno_jefatura?: string;
  plazo_atencion?: number;
  observaciones?: string;
  fecha_asignacion?: string;
  dictaminador?: string;
  folio_scanner?: number;
  id_administracion_fk?: number;
  id_atencion_fk?: number;
  id_documento_fk?: number;
  es_historico?: boolean;
}

@Component({
  selector: 'app-atencion-modal',
  templateUrl: './atencion-modal.component.html',
  styleUrls: ['./atencion-modal.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AtencionModalComponent implements OnInit, OnChanges {
  @ViewChild('pdfContainer') pdfContainer!: ElementRef;

  @Input() asunto: AsuntoPorAtencion | null = null;
  @Input() mostrarModal = false;
  @Output() cerrarModalEvent = new EventEmitter<void>();

  // Variables para documentos
  archivos: ArchivoAtencion[] = [];
  cargandoArchivos = false;
  pdfActual: ArchivoAtencion | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  pdfCargando = false;
  pdfError = false;
  pdfSrc = '';
  
  // Pestañas
  pestanaActiva: 'detalles' | 'documentos' = 'detalles';
  
  // Método para cambiar pestaña y cargar documentos si es necesario
  cambiarPestana(pestaña: 'detalles' | 'documentos'): void {
    this.pestanaActiva = pestaña;
    
    // Si cambia a documentos y no hay archivos cargados, cargarlos
    if (pestaña === 'documentos' && this.asunto && this.asunto.folio_interno && this.archivos.length === 0 && !this.cargandoArchivos) {
      this.cargarArchivos();
    }
  }

  constructor(
    private archivoService: ArchivosAtencionService,
    private asuntoService: AsuntoService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    console.log('🟤 [MODAL GUINDA] ngOnInit - Folio:', this.asunto?.folio_interno);
    if (this.asunto && this.asunto.folio_interno) {
      this.cargarArchivos();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si el asunto cambió o el modal se abrió
    if ((changes['asunto'] && changes['asunto'].currentValue) || 
        (changes['mostrarModal'] && changes['mostrarModal'].currentValue)) {
      
      if (this.asunto && this.asunto.folio_interno && this.mostrarModal) {
        console.log('🟤 [MODAL GUINDA] Cargando archivos:', this.asunto.folio_interno);
        this.cargarArchivos();
      }
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cerrarModalEvent.emit();
    
    // Resetear estado
    this.pdfActual = null;
    this.pdfUrl = null;
    this.pestanaActiva = 'detalles';
    this.pdfError = false;
    this.pdfCargando = false;
  }

  // Método para obtener archivo por índice
  getArchivo(index: number): ArchivoAtencion | null {
    return this.archivos[index] || null;
  }

  // Método para verificar si es el archivo actual
  isArchivoActual(index: number): boolean {
    return this.pdfActual === this.archivos[index];
  }

  // Método para seleccionar archivo por índice
  seleccionarArchivoPorIndice(index: number): void {
    const archivo = this.archivos[index];
    if (archivo) {
      this.seleccionarArchivo(archivo);
    }
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'N/A';
    
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  cargarArchivos(): void {
    if (!this.asunto || !this.asunto.folio_interno) {
      console.warn('🟤 [MODAL GUINDA] No se puede cargar - Folio faltante');
      return;
    }
    
    this.cargandoArchivos = true;
    this.archivos = [];
    
    this.archivoService.listarArchivosPdfAtencion(this.asunto.folio_interno).subscribe({
      next: (archivos: ArchivoAdjunto[]) => {
        if (archivos && archivos.length > 0) {
        this.archivos = archivos.map(archivo => ({
          nombre: archivo.nombre,
            tamano: archivo.tamano,
          ultima_modificacion: archivo.ultima_modificacion,
          ruta_completa: `${this.asunto?.folio_interno}/${archivo.nombre}`
        }));
          console.log(`🟤 [MODAL GUINDA] ${this.archivos.length} archivos cargados`);
        } else {
          this.archivos = [];
          console.log('🟤 [MODAL GUINDA] No hay archivos disponibles');
        }
        this.cargandoArchivos = false;
      },
      error: (error: any) => {
        console.error('🟤 [MODAL GUINDA] Error al cargar archivos:', error.status);
        this.archivos = [];
        this.cargandoArchivos = false;
      }
    });
  }

  // Método para recargar archivos manualmente
  recargarArchivos(): void {
    this.cargarArchivos();
  }

  seleccionarArchivo(archivo: ArchivoAtencion): void {
    console.log('🟤 [MODAL GUINDA] Visualizando PDF:', archivo.nombre);
    
    this.pdfActual = archivo;
    this.pdfCargando = true;
    this.pdfError = false;
    this.pdfUrl = null;
    this.pdfSrc = '';

    if (!this.asunto || !this.asunto.folio_interno || !archivo.nombre) {
      this.pdfError = true;
      this.pdfCargando = false;
      return;
    }

    // Para modal GUINDA: archivos en carpeta raíz (SIN parámetro carpeta)
    this.archivoService.obtenerPdf(
      this.asunto.folio_interno,
      archivo.nombre
    ).subscribe({
      next: (data: string) => {
        if (!data || data.trim() === '') {
          console.error('El servidor devolvió un documento vacío');
          this.pdfError = true;
          this.pdfCargando = false;
          return;
        }
        
        try {
          this.pdfSrc = `data:application/pdf;base64,${data}`;
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfSrc);
          this.pdfCargando = false;
          
          setTimeout(() => {
            if (this.pdfContainer && this.pdfContainer.nativeElement) {
              this.pdfContainer.nativeElement.innerHTML = '';
              const iframe = document.createElement('iframe');
              iframe.src = this.pdfSrc;
              iframe.style.width = '100%';
              iframe.style.height = '500px';
              iframe.style.border = 'none';
              this.pdfContainer.nativeElement.appendChild(iframe);
            }
          }, 100);
        } catch (error) {
          console.error('Error al procesar el PDF:', error);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar el PDF:', err);
        this.pdfError = true;
        this.pdfCargando = false;
      }
    });
  }

  descargarPdf(): void {
    if (!this.pdfActual || !this.asunto || !this.asunto.folio_interno) return;

    // Para modal GUINDA: archivos en carpeta raíz (SIN parámetro carpeta)
    this.archivoService.obtenerPdf(
      this.asunto.folio_interno,
      this.pdfActual.nombre
    ).subscribe({
      next: (data: string) => {
        if (!data) {
          console.error('No se pudo descargar el PDF');
          return;
        }
        
        try {
          const byteCharacters = atob(data);
          const byteArrays = [];
          
          for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
          }
          
          const byteArray = new Uint8Array(byteArrays);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          
          const nombreOriginal = this.pdfActual?.nombre || 'documento.pdf';
          const nombreLimpio = this.limpiarNombreArchivo(nombreOriginal);
          
          link.download = nombreLimpio;
          link.click();
          URL.revokeObjectURL(link.href);
        } catch (error) {
          console.error('Error al procesar la descarga:', error);
        }
      },
      error: (err) => {
        console.error('Error al descargar el PDF:', err);
      }
    });
  }

  private limpiarNombreArchivo(nombre: string): string {
    const regex = /^(.+)_\d{10}(\.[^.]+)$/;
    const match = nombre.match(regex);
    
    if (match) {
      return match[1] + match[2];
    }
    
    return nombre;
  }
  
  getPlazoAtencionTexto(): string {
    if (!this.asunto) return 'Sin plazo definido';
    
    const plazo = this.asunto.plazo_atencion;
    
    if (plazo === 0) {
      return 'Urgente';
    } else if (plazo && plazo > 0) {
      return `${plazo} días`;
    } else {
      return 'Sin plazo definido';
    }
  }
  
  isPlazoUrgente(): boolean {
    return this.asunto?.plazo_atencion === 0;
  }
  
  getTipoDocumento(): string {
    if (!this.asunto || this.asunto.id_documento_fk === undefined) return 'No especificado';
    
    switch (this.asunto.id_documento_fk) {
      case 1: return 'RESPUESTA';
      case 2: return 'REQUERIMIENTO';
      case 3: return 'REQUERIMIENTO Y RESPUESTA';
      case 4: return 'SOLICITUD INTERNA';
      case 5: return 'RESPUESTA INTERNA';
      case 6: return 'RESPUESTA A FGR';
      case 7: return 'ALCANCE';
      default: return `Tipo ${this.asunto.id_documento_fk}`;
    }
  }
  
  getTipoAtencion(): string {
    if (!this.asunto || this.asunto.id_atencion_fk === undefined) return 'No especificado';
    
    switch (this.asunto.id_atencion_fk) {
      case 1: return 'TOTAL';
      case 2: return 'PARCIAL';
      case 3: return 'EN TRÁMITE';
      case 5: return 'NO APLICA';
      default: return `Tipo ${this.asunto.id_atencion_fk}`;
    }
  }
  
  getAdministracionTexto(): string {
    if (!this.asunto || this.asunto.id_administracion_fk === undefined) return 'No especificada';
    
    return `Administración ${this.asunto.id_administracion_fk}`;
  }
}
