import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SafePipe } from '../../../../../shared/pipes/safe.pipe';
import { environment } from '../../../../../../environments/environment';
import { ArchivosAtencionService } from '../../../../services/archivos-atencion.service';

@Component({
  selector: 'app-revision-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SafePipe],
  templateUrl: './revision-modal.component.html',
  styleUrls: ['./revision-modal.component.css']
})
export class RevisionModalComponent implements OnInit {
  @Input() mostrarModal: boolean = false;
  @Input() asunto: any = null;
  @Input() archivos: any[] = [];
  
  @Output() cerrarModalEvent = new EventEmitter<void>();
  @Output() aprobarAsuntoEvent = new EventEmitter<{id: number, observaciones: string, tipoAprobacion: 'parcial' | 'total'}>();
  @Output() rechazarAsuntoEvent = new EventEmitter<{id: number, observaciones: string, motivo: string}>();
  @Output() regresarAsuntoEvent = new EventEmitter<{id: number, observaciones: string, motivo: string}>();
  
  // Formulario para observaciones
  formularioRevision: FormGroup;
  
  // Estado del visor de PDF
  pdfActual: any = null;
  pdfUrl: string = '';
  pdfCargando: boolean = false;
  pdfError: boolean = false;
  
  // Pestañas y vistas
  pestanaActiva: 'detalles' | 'documentos' | 'revision' = 'detalles';
  
  // Motivos de rechazo predefinidos
  motivosRechazo: string[] = [
    'Información incompleta',
    'Documentación con errores',
    'No cumple con los requisitos',
    'Requiere correcciones menores',
    'Requiere correcciones mayores',
    'Otro motivo'
  ];

  // Motivos para regresar al dictaminador
  motivosRegreso: string[] = [
    'Requiere información adicional',
    'Documentación incompleta',
    'Necesita correcciones técnicas',
    'Falta documentación soporte',
    'Requiere aclaración de criterios',
    'Otro motivo'
  ];
  
  // Estados de la interfaz
  enviandoAprobacion: boolean = false;
  enviandoRechazo: boolean = false;
  enviandoRegreso: boolean = false;
  
  // Tipo de aprobación seleccionada
  tipoAprobacionSeleccionada: 'parcial' | 'total' | null = null;
  
  // Variables para el modal de confirmación
  mostrarModalConfirmacion: boolean = false;
  tipoAtencionSeleccionada: 'parcial' | 'total' | null = null;
  
  constructor(
    private fb: FormBuilder,
    private archivosService: ArchivosAtencionService
  ) {
    this.formularioRevision = this.fb.group({
      observaciones: [''],
      motivo: ['']
    });
  }
  
  ngOnInit(): void {
    console.log('🔧 [RevisionModal] ngOnInit ejecutado');
    console.log('🔧 [RevisionModal] Asunto recibido:', this.asunto);
    console.log('🔧 [RevisionModal] Archivos recibidos:', this.archivos);
    console.log('🔧 [RevisionModal] Número de archivos:', this.archivos?.length || 0);
    
    // Si hay archivos, preseleccionar el primero para visualización
    if (this.archivos && this.archivos.length > 0) {
      console.log('🔧 [RevisionModal] Seleccionando primer archivo:', this.archivos[0]);
      this.seleccionarArchivo(this.archivos[0]);
    } else {
      console.log('🔧 [RevisionModal] No hay archivos para mostrar');
    }
  }
  
  cerrarModal(): void {
    this.mostrarModal = false;
    this.cerrarModalEvent.emit();
    this.resetearFormulario();
  }
  
  cambiarPestana(pestana: 'detalles' | 'documentos' | 'revision'): void {
    this.pestanaActiva = pestana;
  }
  
  seleccionarArchivo(archivo: any): void {
    this.pdfActual = archivo;
    this.pdfCargando = true;
    this.pdfError = false;
    
    if (this.asunto && this.pdfActual) {
      // Extraer el nombre base del archivo sin timestamp si existe
      let nombreArchivo = archivo.nombre;
      const timestampMatch = nombreArchivo.match(/(.+\.pdf)-\d+$/);
      if (timestampMatch && timestampMatch[1]) {
        nombreArchivo = timestampMatch[1];
        console.log(`Nombre de archivo original: ${archivo.nombre}, nombre base: ${nombreArchivo}`);
      }

      this.archivosService.obtenerPdf(
        this.asunto.folio_interno, 
        nombreArchivo,
        'atencion'  // Pasar el parámetro carpeta='atencion'
      ).subscribe({
        next: (data: string) => {
          // Verificar que recibimos datos válidos
          if (!data || data.trim() === '') {
            console.error('El servidor devolvió un documento vacío');
            this.pdfError = true;
            this.pdfCargando = false;
            return;
          }
          
          try {
            // Crear URL para el PDF en base64
            this.pdfUrl = `data:application/pdf;base64,${data}`;
            this.pdfCargando = false;
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
  }
  
  aprobarAsunto(tipoAprobacion: 'parcial' | 'total'): void {
    if (this.formularioRevision.valid && this.asunto) {
      this.enviandoAprobacion = true;
      this.tipoAprobacionSeleccionada = tipoAprobacion;
      
      // Emitir evento de aprobación con las observaciones y tipo
      this.aprobarAsuntoEvent.emit({
        id: this.asunto.id_asunto,
        observaciones: this.formularioRevision.get('observaciones')?.value,
        tipoAprobacion: tipoAprobacion
      });
      
      // En un caso real, esperaríamos la respuesta del servicio
      // Aquí simulamos un tiempo de espera
      setTimeout(() => {
        this.enviandoAprobacion = false;
        this.tipoAprobacionSeleccionada = null;
        this.cerrarModal();
      }, 1000);
    }
  }
  
  rechazarAsunto(): void {
    if (this.formularioRevision.valid && this.asunto) {
      // Validar que se haya seleccionado un motivo de rechazo
      const motivo = this.formularioRevision.get('motivo')?.value;
      if (!motivo) {
        // Marcar el campo como tocado para mostrar el error
        this.formularioRevision.get('motivo')?.markAsTouched();
        return;
      }
      
      this.enviandoRechazo = true;
      
      // Emitir evento de rechazo con las observaciones y el motivo
      this.rechazarAsuntoEvent.emit({
        id: this.asunto.id_asunto,
        observaciones: this.formularioRevision.get('observaciones')?.value,
        motivo: motivo
      });
      
      // En un caso real, esperaríamos la respuesta del servicio
      // Aquí simulamos un tiempo de espera
      setTimeout(() => {
        this.enviandoRechazo = false;
        this.cerrarModal();
      }, 1000);
    }
  }

  regresarAsunto(): void {
    if (this.asunto) {
      // Solo validar que haya observaciones
      const observaciones = this.formularioRevision.get('observaciones')?.value;
      if (!observaciones || observaciones.trim().length === 0) {
        // Marcar el campo como tocado para mostrar el error
        this.formularioRevision.get('observaciones')?.markAsTouched();
        return;
      }
      
      this.enviandoRegreso = true;
      
      // Emitir evento de regreso solo con las observaciones
      this.regresarAsuntoEvent.emit({
        id: this.asunto.id_asunto,
        observaciones: observaciones,
        motivo: 'Regresado con observaciones' // Motivo fijo
      });
      
      // En un caso real, esperaríamos la respuesta del servicio
      // Aquí simulamos un tiempo de espera
      setTimeout(() => {
        this.enviandoRegreso = false;
        this.cerrarModal();
      }, 1000);
    }
  }
  
  // Funciones para el modal de confirmación
  mostrarConfirmacionAtencion(tipoAtencion: 'parcial' | 'total'): void {
    this.tipoAtencionSeleccionada = tipoAtencion;
    this.mostrarModalConfirmacion = true;
  }
  
  cerrarModalConfirmacion(): void {
    this.mostrarModalConfirmacion = false;
    this.tipoAtencionSeleccionada = null;
  }
  
  confirmarAtencion(): void {
    if (this.tipoAtencionSeleccionada) {
      this.cerrarModalConfirmacion();
      this.aprobarAsunto(this.tipoAtencionSeleccionada);
    }
  }
  
  resetearFormulario(): void {
    this.formularioRevision.reset({
      observaciones: '',
      motivo: ''
    });
    this.tipoAprobacionSeleccionada = null;
    this.tipoAtencionSeleccionada = null;
    this.mostrarModalConfirmacion = false;
  }
  
  // Método para formatear fechas
  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return fecha;
    }
  }
}
