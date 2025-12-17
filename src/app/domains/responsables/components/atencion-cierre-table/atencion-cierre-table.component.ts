import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { AtencionService, AtencionConEspecialistas } from '../../services/atencion.service';
import { ExpedienteTlapohualliService } from '../../../capture/services/expediente-tlapohualli.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AtencionCierreItem {
  id: number;
  idAtencion: number;
  idExpediente: number;
  expediente: string; // Número de expediente
  diasAtraso: number;
  // Información del responsable
  usuarioRegistro?: string;
  tipoAccion?: string;
  especialistas?: string[]; // Nombres de especialistas
  // TICKET MS-SAT
  ticketNumero: string;
  ticketFechaApertura: Date;
  ticketFechaResolucion: Date | null;
  // RESPUESTA
  respuestaEstado: string;
  respuestaTipo: string;
  respuestaNumero: string;
  respuestaFecha: Date | null;
  // NOTIFICACION
  notificacionFecha: Date | null;
  notificacionModelo: string;
  // DISPOSITIVO
  dispositivoSerie: string;
  dispositivoObservaciones: string;
  // OBSERVACIONES
  observaciones: string;
}

@Component({
  selector: 'app-atencion-cierre-table',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './atencion-cierre-table.component.html',
  styleUrl: './atencion-cierre-table.component.css'
})
export class AtencionCierreTableComponent implements OnInit {
  // Datos cargados del backend
  items: AtencionCierreItem[] = [];
  cargando: boolean = true;

  // Formulario para edición
  editForm: FormGroup;
  editingItemId: number | null = null;

  // Opciones para dropdowns
  estadosRespuesta = ['Pendiente', 'En Proceso', 'Completado', 'Cancelado'];
  tiposRespuesta = ['Oficio', 'Email', 'Telefónica', 'Presencial'];

  constructor(
    private fb: FormBuilder,
    private atencionService: AtencionService,
    private expedienteService: ExpedienteTlapohualliService
  ) {
    this.editForm = this.fb.group({
      ticketNumero: [''],
      ticketFechaApertura: [''],
      ticketFechaResolucion: [''],
      respuestaEstado: [''],
      respuestaTipo: [''],
      respuestaNumero: [''],
      respuestaFecha: [''],
      notificacionFecha: [''],
      notificacionModelo: [''],
      dispositivoSerie: [''],
      dispositivoObservaciones: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Cargar todas las atenciones de todos los responsables
   */
  cargarDatos(): void {
    this.cargando = true;
    console.log('📋 [AtencionCierre] Cargando todas las atenciones...');

    this.atencionService.obtenerTodasAtenciones().subscribe({
      next: (atenciones: AtencionConEspecialistas[]) => {
        console.log('✅ [AtencionCierre] Atenciones recibidas:', atenciones);
        
        // Mapear atenciones a items de la tabla (simplificado - obtener expedientes después si es necesario)
        this.items = atenciones.map((atencion, index) => {
          const item: AtencionCierreItem = {
            id: index + 1,
            idAtencion: atencion.atencion.id_atencion,
            idExpediente: atencion.atencion.id_expediente,
            expediente: `EXP-${atencion.atencion.id_expediente}`, // Se actualizará si se obtiene el expediente
            diasAtraso: 0,
            usuarioRegistro: atencion.atencion.usuario_registro || undefined,
            tipoAccion: atencion.atencion.tipo_accion,
            especialistas: atencion.especialistas.map(esp => esp.nombre_especialista),
            // TICKET MS-SAT - Inicializar con valores vacíos (se llenarán con los 4 formularios)
            ticketNumero: '',
            ticketFechaApertura: atencion.atencion.fecha_registro 
              ? new Date(atencion.atencion.fecha_registro) 
              : new Date(),
            ticketFechaResolucion: null,
            // RESPUESTA
            respuestaEstado: 'Pendiente',
            respuestaTipo: '',
            respuestaNumero: '',
            respuestaFecha: null,
            // NOTIFICACION
            notificacionFecha: null,
            notificacionModelo: '',
            // DISPOSITIVO
            dispositivoSerie: '',
            dispositivoObservaciones: '',
            // OBSERVACIONES
            observaciones: ''
          };
          
          // Calcular días de atraso
          item.diasAtraso = this.calcularDiasAtraso(item.ticketFechaApertura);
          
          // Intentar obtener el número de expediente (opcional, no bloquea)
          this.expedienteService.obtenerExpedientePorId(atencion.atencion.id_expediente).pipe(
            catchError(() => of(null))
          ).subscribe(expediente => {
            if (expediente?.expediente) {
              const itemIndex = this.items.findIndex(i => i.idAtencion === item.idAtencion);
              if (itemIndex !== -1) {
                this.items[itemIndex].expediente = expediente.expediente;
              }
            }
          });
          
          return item;
        });
        
        this.cargando = false;
        console.log('✅ [AtencionCierre] Items cargados:', this.items.length);
      },
      error: (error) => {
        console.error('❌ [AtencionCierre] Error al cargar atenciones:', error);
        this.cargando = false;
      }
    });
  }

  calcularDiasAtraso(fechaApertura: Date): number {
    const hoy = new Date();
    const diferencia = hoy.getTime() - fechaApertura.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    return dias;
  }

  getSemaforoClass(diasAtraso: number): string {
    if (diasAtraso <= 0) {
      return 'semaforo-verde';
    } else if (diasAtraso <= 5) {
      return 'semaforo-naranja';
    } else {
      return 'semaforo-rojo';
    }
  }

  getSemaforoLabel(diasAtraso: number): string {
    if (diasAtraso <= 0) {
      return 'Hasta 0 Días Hábiles';
    } else if (diasAtraso <= 5) {
      return 'Hasta 5 Días Hábiles';
    } else {
      return 'Después de 6 Días Hábiles';
    }
  }

  editarItem(item: AtencionCierreItem): void {
    this.editingItemId = item.id;
    this.editForm.patchValue({
      ticketNumero: item.ticketNumero,
      ticketFechaApertura: item.ticketFechaApertura,
      ticketFechaResolucion: item.ticketFechaResolucion,
      respuestaEstado: item.respuestaEstado,
      respuestaTipo: item.respuestaTipo,
      respuestaNumero: item.respuestaNumero,
      respuestaFecha: item.respuestaFecha,
      notificacionFecha: item.notificacionFecha,
      notificacionModelo: item.notificacionModelo,
      dispositivoSerie: item.dispositivoSerie,
      dispositivoObservaciones: item.dispositivoObservaciones,
      observaciones: item.observaciones
    });
  }

  guardarItem(): void {
    if (this.editingItemId && this.editForm.valid) {
      const index = this.items.findIndex(item => item.id === this.editingItemId);
      if (index !== -1) {
        const formValue = this.editForm.value;
        this.items[index] = {
          ...this.items[index],
          ...formValue
        };
        this.editingItemId = null;
        this.editForm.reset();
      }
    }
  }

  cancelarEdicion(): void {
    this.editingItemId = null;
    this.editForm.reset();
  }

  formatearFecha(fecha: Date | null): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Getters para FormControls con tipo correcto
  get ticketNumeroControl(): FormControl {
    return this.editForm.get('ticketNumero') as FormControl;
  }

  get ticketFechaAperturaControl(): FormControl {
    return this.editForm.get('ticketFechaApertura') as FormControl;
  }

  get ticketFechaResolucionControl(): FormControl {
    return this.editForm.get('ticketFechaResolucion') as FormControl;
  }

  get respuestaEstadoControl(): FormControl {
    return this.editForm.get('respuestaEstado') as FormControl;
  }

  get respuestaTipoControl(): FormControl {
    return this.editForm.get('respuestaTipo') as FormControl;
  }

  get respuestaNumeroControl(): FormControl {
    return this.editForm.get('respuestaNumero') as FormControl;
  }

  get respuestaFechaControl(): FormControl {
    return this.editForm.get('respuestaFecha') as FormControl;
  }

  get notificacionFechaControl(): FormControl {
    return this.editForm.get('notificacionFecha') as FormControl;
  }

  get notificacionModeloControl(): FormControl {
    return this.editForm.get('notificacionModelo') as FormControl;
  }

  get dispositivoSerieControl(): FormControl {
    return this.editForm.get('dispositivoSerie') as FormControl;
  }

  get dispositivoObservacionesControl(): FormControl {
    return this.editForm.get('dispositivoObservaciones') as FormControl;
  }

  get observacionesControl(): FormControl {
    return this.editForm.get('observaciones') as FormControl;
  }
}

