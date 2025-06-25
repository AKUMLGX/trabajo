import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { AsuntoService } from '../../../../../domains/services/asunto.service';
import { ArchivosAtencionService, ArchivoAdjunto } from '../../../../../domains/services/archivos-atencion.service';
import { environment } from '../../../../../../environments/environment';
import { CommonModule } from '@angular/common';

// Interfaces
interface ArchivoAtencion {
  id?: number;
  nombre: string;
  ruta_completa?: string;
  tamano_bytes: number;
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
}

@Component({
  selector: 'app-atencion-modal',
  templateUrl: './atencion-modal.component.html',
  styleUrls: ['./atencion-modal.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AtencionModalComponent implements OnInit {
  @ViewChild('pdfContainer') pdfContainer!: ElementRef;

  @Input() asunto: AsuntoPorAtencion | null = null;
  @Input() mostrarModal: boolean = false;
  @Output() cerrarModalEvent = new EventEmitter<void>();

  // Variables para documentos
  archivos: ArchivoAtencion[] = [];
  cargandoArchivos: boolean = false;
  pdfActual: ArchivoAtencion | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  pdfCargando: boolean = false;
  pdfError: boolean = false;
  pdfSrc: string = '';
  pdfHtml: SafeHtml | null = null;
  
  // Pestañas
  pestanaActiva: 'detalles' | 'documentos' = 'detalles';

  constructor(
    private archivoService: ArchivosAtencionService,
    private asuntoService: AsuntoService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    if (this.asunto) {
      this.cargarArchivos();
    }
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.cerrarModalEvent.emit();
    this.pdfActual = null;
    this.pdfUrl = null;
    this.pdfHtml = null;
    this.pestanaActiva = 'detalles'; // Resetear a la pestaña de detalles al cerrar
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
    if (!this.asunto || !this.asunto.folio_interno) return;
    
    this.cargandoArchivos = true;
    this.archivoService.listarArchivosPdf(this.asunto.folio_interno).subscribe({
      next: (archivos: ArchivoAdjunto[]) => {
        // Convertir los archivos al formato que necesitamos
        this.archivos = archivos.map(archivo => ({
          nombre: archivo.nombre,
          tamano_bytes: archivo.tamano_bytes,
          ultima_modificacion: archivo.ultima_modificacion,
          // Crear una ruta_completa simulada para usar en la carga del PDF
          ruta_completa: `${this.asunto?.folio_interno}/${archivo.nombre}`
        }));
        this.cargandoArchivos = false;
        
        // Si hay archivos, preseleccionar el primero
        if (this.archivos.length > 0 && this.pestanaActiva === 'documentos') {
          this.seleccionarArchivo(this.archivos[0]);
        }
      },
      error: (error: any) => {
        console.error('Error al cargar archivos:', error);
        this.archivos = [];
        this.cargandoArchivos = false;
      }
    });
  }

  seleccionarArchivo(archivo: ArchivoAtencion): void {
    this.pdfActual = archivo;
    this.pdfCargando = true;
    this.pdfError = false;
    this.pdfUrl = null;
    this.pdfSrc = '';
    this.pdfHtml = null;

    if (!this.asunto || !this.asunto.folio_interno || !archivo.nombre) {
      this.pdfError = true;
      this.pdfCargando = false;
      return;
    }

    // Usar el método obtenerPdf del servicio
    this.archivoService.obtenerPdf(
      this.asunto.folio_interno,
      archivo.nombre,
      'atencion' // Carpeta donde se encuentran los archivos
    ).subscribe({
      next: (data: string) => {
        if (!data || data.trim() === '') {
          console.error('El servidor devolvió un documento vacío');
          this.pdfError = true;
          this.pdfCargando = false;
          return;
        }
        
        try {
          // Crear URL para el PDF en base64
          this.pdfSrc = `data:application/pdf;base64,${data}`;
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfSrc);
          this.pdfCargando = false;
          
          // Actualizar el contenido del contenedor
          setTimeout(() => {
            if (this.pdfContainer && this.pdfContainer.nativeElement) {
              this.pdfContainer.nativeElement.innerHTML = '';
              const div = document.createElement('div');
              div.innerHTML = `<iframe src="${this.pdfSrc}" style="width: 100%; height: 100%; border: none;"></iframe>`;
              this.pdfContainer.nativeElement.appendChild(div);
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

    this.archivoService.obtenerPdf(
      this.asunto.folio_interno,
      this.pdfActual.nombre,
      'atencion'
    ).subscribe({
      next: (data: string) => {
        if (!data) {
          console.error('No se pudo descargar el PDF');
          return;
        }
        
        try {
          // Crear un blob desde los datos base64
          const byteCharacters = atob(data);
          const byteArrays = [];
          
          for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays.push(byteCharacters.charCodeAt(i));
          }
          
          const byteArray = new Uint8Array(byteArrays);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          
          // Crear un enlace para la descarga
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          
          // Extraer nombre del archivo sin timestamp
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

  // Función para limpiar el nombre del archivo (quitar timestamp)
  private limpiarNombreArchivo(nombre: string): string {
    // Intenta quitar el timestamp del formato "nombre_1234567890.pdf"
    const regex = /^(.+)_\d{10}(\.[^.]+)$/;
    const match = nombre.match(regex);
    
    if (match) {
      return match[1] + match[2]; // nombre + extensión
    }
    
    return nombre; // Si no coincide con el patrón, devuelve el nombre original
  }
}
