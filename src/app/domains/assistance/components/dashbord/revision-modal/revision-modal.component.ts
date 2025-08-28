import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SafePipe } from '../../../../../shared/pipes/safe.pipe';
import { environment } from '../../../../../../environments/environment';
import { ArchivosAtencionService } from '../../../../services/archivos-atencion.service';
import { DictaminadorBandejaService } from '../../../../services/dictaminador-bandeja.service';

@Component({
  selector: 'app-revision-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SafePipe],
  templateUrl: './revision-modal.component.html',
  styleUrls: ['./revision-modal.component.css']
})
export class RevisionModalComponent implements OnInit {
  @Input() mostrarModal = false;
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
  pdfUrl = '';
  pdfCargando = false;
  pdfError = false;

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
  enviandoAprobacion = false;
  enviandoRechazo = false;
  enviandoRegreso = false;

  // Tipo de aprobación seleccionada
  tipoAprobacionSeleccionada: 'parcial' | 'total'  = "parcial";

  // Variables para el modal de confirmación
  mostrarModalConfirmacion = false;
  tipoAtencionSeleccionada: 'parcial' | 'total'  = "parcial";

  constructor(
    private fb: FormBuilder,
    private archivosService: ArchivosAtencionService,
    private dictaminadorBandejaService: DictaminadorBandejaService
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

      const idAsunto = this.asunto?.id_asunto
        ?? this.asunto?.datos?.id_asunto_nuevo
        ?? this.asunto?.datos?.id_asunto_historico
        ?? this.asunto?.asunto?.datos?.id_asunto_nuevo
        ?? this.asunto?.asunto?.datos?.id_asunto_historico
        ?? this.asunto?.id_asunto_nuevo
        ?? this.asunto?.id_asunto_historico;

      console.log('[RevisionModal] aprobarAsunto() -> id:', idAsunto, 'tipo:', tipoAprobacion);

      // Emitir evento de aprobación con las observaciones y tipo
      this.aprobarAsuntoEvent.emit({
        id: Number(idAsunto),
        observaciones: this.formularioRevision.get('observaciones')?.value,
        tipoAprobacion: tipoAprobacion
      });

      // En un caso real, esperaríamos la respuesta del servicio
      // Aquí simulamos un tiempo de espera
      setTimeout(() => {
        this.enviandoAprobacion = false;
        this.tipoAprobacionSeleccionada = "parcial";
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

      const idAsunto = this.asunto?.id_asunto
        ?? this.asunto?.datos?.id_asunto_nuevo
        ?? this.asunto?.datos?.id_asunto_historico
        ?? this.asunto?.asunto?.datos?.id_asunto_nuevo
        ?? this.asunto?.asunto?.datos?.id_asunto_historico
        ?? this.asunto?.id_asunto_nuevo
        ?? this.asunto?.id_asunto_historico;

      console.log('[RevisionModal] rechazarAsunto() -> id:', idAsunto, 'motivo:', motivo);

      // Disparar rechazo vía endpoint resolver (aprobado=false)
      this.dictaminadorBandejaService.resolverAsunto(Number(idAsunto), false,"").subscribe({
        next: (resp) => {
          console.log('[RevisionModal] Resolver (rechazo) OK:', resp);
          // Emitir evento para que el padre actualice la tabla
          this.rechazarAsuntoEvent.emit({
            id: Number(idAsunto),
            observaciones: this.formularioRevision.get('observaciones')?.value,
            motivo: motivo
          });
          this.enviandoRechazo = false;
          this.cerrarModal();
        },
        error: (err) => {
          console.error('[RevisionModal] Error al rechazar asunto:', err);
          this.enviandoRechazo = false;
        }
      });
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

      const idAsunto = this.asunto?.id_asunto
        ?? this.asunto?.datos?.id_asunto_nuevo
        ?? this.asunto?.datos?.id_asunto_historico
        ?? this.asunto?.asunto?.datos?.id_asunto_nuevo
        ?? this.asunto?.asunto?.datos?.id_asunto_historico
        ?? this.asunto?.id_asunto_nuevo
        ?? this.asunto?.id_asunto_historico;

      console.log('[RevisionModal] regresarAsunto() -> id:', idAsunto, 'observaciones:', observaciones);

      // Usar resolver para marcar como rechazado (aprobado=false)
      this.dictaminadorBandejaService.resolverAsunto(Number(idAsunto), false, observaciones).subscribe({
        next: (resp) => {
          console.log('[RevisionModal] Resolver (regresar) OK:', resp);
          this.regresarAsuntoEvent.emit({
            id: Number(idAsunto),
            observaciones: observaciones,
            motivo: 'Regresado con observaciones'
          });
          this.enviandoRegreso = false;
          this.cerrarModal();
        },
        error: (err) => {
          console.error('[RevisionModal] Error al regresar asunto:', err);
          this.enviandoRegreso = false;
        }
      });
    }
  }

  // Funciones para el modal de confirmación
  mostrarConfirmacionAtencion(tipoAtencion: 'parcial' | 'total'): void {
    this.tipoAtencionSeleccionada = tipoAtencion;
    this.mostrarModalConfirmacion = true;
  }

  cerrarModalConfirmacion(): void {
    this.mostrarModalConfirmacion = false;
    this.tipoAtencionSeleccionada = "parcial";
  }

  confirmarAtencion(): void {
    if (!this.tipoAtencionSeleccionada) {
      console.warn('[RevisionModal] No hay tipo de atención seleccionado');
      return;
    }

    // No cerrar el modal de confirmación hasta recibir respuesta
    // Intentar obtener id_asunto con diferentes formas del objeto
    const idAsunto = this.asunto?.id_asunto
      ?? this.asunto?.datos?.id_asunto_nuevo
      ?? this.asunto?.datos?.id_asunto_historico
      ?? this.asunto?.asunto?.datos?.id_asunto_nuevo
      ?? this.asunto?.asunto?.datos?.id_asunto_historico
      ?? this.asunto?.id_asunto_nuevo
      ?? this.asunto?.id_asunto_historico;

    console.log('[RevisionModal] confirmarAtencion() -> idAsunto:', idAsunto, 'tipo:', this.tipoAtencionSeleccionada);

    if (!idAsunto) {
      console.error('[RevisionModal] No se encontró id_asunto para resolver. Objeto asunto:', this.asunto);
      return;
    }

    this.enviandoAprobacion = true;
    // Enviar al backend exactamente lo que seleccionó el usuario: 'parcial' | 'total'
    const observacionSeleccion = this.tipoAtencionSeleccionada;
    this.dictaminadorBandejaService.resolverAsunto(Number(idAsunto), true, observacionSeleccion ).subscribe({
      next: (resp) => {
        console.log('[RevisionModal] Resolver OK:', resp);
        this.enviandoAprobacion = false;
        // Cerrar modal de confirmación y disparar flujo de UI
        this.cerrarModalConfirmacion();
        this.aprobarAsunto(this.tipoAtencionSeleccionada!);
      },
      error: (err) => {
        this.enviandoAprobacion = false;
        console.error('[RevisionModal] Error al resolver asunto:', err);
      }
    });
  }

  resetearFormulario(): void {
    this.formularioRevision.reset({
      observaciones: '',
      motivo: ''
    });
    this.tipoAprobacionSeleccionada = "parcial";
    this.tipoAtencionSeleccionada = "parcial";
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
