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
  @Output() aprobarAsuntoEvent = new EventEmitter<{id: number, observaciones: string}>();
  @Output() rechazarAsuntoEvent = new EventEmitter<{id: number, observaciones: string, motivo: string}>();
  
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
  
  // Estados de la interfaz
  enviandoAprobacion: boolean = false;
  enviandoRechazo: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private archivosService: ArchivosAtencionService
  ) {
    this.formularioRevision = this.fb.group({
      observaciones: ['', [Validators.required, Validators.minLength(10)]],
      motivo: ['']
    });
  }
  
  ngOnInit(): void {
    // Si hay archivos, preseleccionar el primero para visualización
    if (this.archivos && this.archivos.length > 0) {
      this.seleccionarArchivo(this.archivos[0]);
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
      this.archivosService.obtenerPdf(
        this.asunto.folio_interno, 
        archivo.nombre
      ).subscribe({
        next: (data: string) => {
          // Crear URL para el PDF en base64
          this.pdfUrl = `data:application/pdf;base64,${data}`;
          this.pdfCargando = false;
        },
        error: (err) => {
          console.error('Error al cargar el PDF:', err);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      });
    }
  }
  
  aprobarAsunto(): void {
    if (this.formularioRevision.valid && this.asunto) {
      this.enviandoAprobacion = true;
      
      // Emitir evento de aprobación con las observaciones
      this.aprobarAsuntoEvent.emit({
        id: this.asunto.id_asunto,
        observaciones: this.formularioRevision.get('observaciones')?.value
      });
      
      // En un caso real, esperaríamos la respuesta del servicio
      // Aquí simulamos un tiempo de espera
      setTimeout(() => {
        this.enviandoAprobacion = false;
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
  
  resetearFormulario(): void {
    this.formularioRevision.reset({
      observaciones: '',
      motivo: ''
    });
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
