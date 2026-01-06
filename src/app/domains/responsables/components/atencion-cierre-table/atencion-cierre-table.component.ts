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
import { MatDialog } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { AtencionService, AtencionConEspecialistas } from '../../services/atencion.service';
import { ExpedienteTlapohualliService } from '../../../capture/services/expediente-tlapohualli.service';
import { CierreService } from '../../services/cierre.service';
import { CierreModalComponent } from '../cierre-modal/cierre-modal.component';
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
    private expedienteService: ExpedienteTlapohualliService,
    private cierreService: CierreService,
    private dialog: MatDialog
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

  // === Contadores de semáforo para la vista resumen ===
  get totalVerde(): number {
    return this.items.filter(i => this.getSemaforoClass(i.diasAtraso) === 'semaforo-verde').length;
  }

  get totalNaranja(): number {
    return this.items.filter(i => this.getSemaforoClass(i.diasAtraso) === 'semaforo-naranja').length;
  }

  get totalRojo(): number {
    return this.items.filter(i => this.getSemaforoClass(i.diasAtraso) === 'semaforo-rojo').length;
  }

  /**
   * Cargar todas las atenciones de todos los responsables
   */
  cargarDatos(): void {
    this.cargando = true;
    this.items = []; // Limpiar items anteriores
    console.log('📋 [AtencionCierre] Cargando todas las atenciones...');

    this.atencionService.obtenerTodasAtenciones().subscribe({
      next: (atenciones: AtencionConEspecialistas[]) => {
        console.log('✅ [AtencionCierre] Atenciones recibidas:', atenciones.length);
        
        if (atenciones.length === 0) {
          this.items = [];
          this.cargando = false;
          console.log('ℹ️ [AtencionCierre] No hay atenciones registradas');
          return;
        }
        
        // Mapear atenciones a items de la tabla y cargar datos de cierre
        const itemsPromises = atenciones.map((atencion, index) => {
          const fechaRegistro = atencion.atencion.fecha_registro 
            ? new Date(atencion.atencion.fecha_registro) 
            : new Date();
          
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
            ticketFechaApertura: fechaRegistro,
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
          
          // Obtener datos de cierre si existen (sin bloquear si no hay)
          return this.cierreService.obtenerCierrePorAtencion(atencion.atencion.id_atencion).pipe(
            map(cierreResponse => {
              if (cierreResponse.success && cierreResponse.data) {
                const cierre = cierreResponse.data;
                // Actualizar item con datos de cierre
                item.ticketNumero = cierre.ticket_numero || '';
                if (cierre.ticket_fecha_apertura) {
                  item.ticketFechaApertura = new Date(cierre.ticket_fecha_apertura);
                }
                if (cierre.ticket_fecha_resolucion) {
                  item.ticketFechaResolucion = new Date(cierre.ticket_fecha_resolucion);
                }
                item.respuestaEstado = cierre.respuesta_estado || 'Pendiente';
                item.respuestaTipo = cierre.respuesta_tipo || '';
                item.respuestaNumero = cierre.respuesta_numero || '';
                if (cierre.respuesta_fecha) {
                  item.respuestaFecha = new Date(cierre.respuesta_fecha);
                }
                if (cierre.notificacion_fecha) {
                  item.notificacionFecha = new Date(cierre.notificacion_fecha);
                }
                item.notificacionModelo = cierre.notificacion_modelo || '';
                item.dispositivoSerie = cierre.dispositivo_serie || '';
                item.dispositivoObservaciones = cierre.dispositivo_observaciones || '';
                item.observaciones = cierre.observaciones || '';
                
                // Recalcular días de atraso con fecha actualizada
                item.diasAtraso = this.calcularDiasAtraso(item.ticketFechaApertura);
              }
              return item;
            }),
            catchError((error) => {
              console.log('ℹ️ [AtencionCierre] No hay cierre para atención', atencion.atencion.id_atencion);
              return of(item);
            })
          );
        });
        
        // Esperar a que todas las promesas se resuelvan
        forkJoin(itemsPromises).subscribe({
          next: (items) => {
            console.log('✅ [AtencionCierre] Items procesados:', items.length);
            this.items = items;
            
            // Intentar obtener números de expediente (opcional, no bloquea)
            items.forEach((item) => {
              this.expedienteService.obtenerExpedientePorId(item.idExpediente).pipe(
                catchError(() => of(null))
              ).subscribe(expediente => {
                if (expediente?.expediente) {
                  const itemIndex = this.items.findIndex(i => i.idAtencion === item.idAtencion);
                  if (itemIndex !== -1) {
                    this.items[itemIndex].expediente = expediente.expediente;
                  }
                }
              });
            });
            
            this.cargando = false;
            console.log('✅ [AtencionCierre] Items cargados exitosamente:', this.items.length);
          },
          error: (error) => {
            console.error('❌ [AtencionCierre] Error al cargar items:', error);
            this.cargando = false;
            this.items = [];
          }
        });
      },
      error: (error) => {
        console.error('❌ [AtencionCierre] Error al cargar atenciones:', error);
        this.cargando = false;
        this.items = [];
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

  /**
   * Abrir modal de cierre para llenar los 4 formularios
   */
  abrirModalCierre(item: AtencionCierreItem): void {
    console.log('📋 [AtencionCierre] Abriendo modal de cierre para:', item.expediente);
    
    // Obtener datos de cierre existente si hay
    this.cierreService.obtenerCierrePorAtencion(item.idAtencion).subscribe({
      next: (response) => {
        const dialogRef = this.dialog.open(CierreModalComponent, {
          maxWidth: '95vw',
          maxHeight: '95vh',
          panelClass: 'cierre-modal-panel',
          data: {
            idAtencion: item.idAtencion,
            idExpediente: item.idExpediente,
            expediente: item.expediente,
            cierreExistente: response.success ? response.data : undefined
          },
          disableClose: false
        });

        dialogRef.afterClosed().subscribe((result) => {
          console.log('📋 [AtencionCierre] Modal de cierre cerrado:', result);
          if (result?.success) {
            // Recargar datos si se guardó un cierre
            this.cargarDatos();
          }
        });
      },
      error: (error) => {
        // Si no existe cierre, abrir modal vacío
        const dialogRef = this.dialog.open(CierreModalComponent, {
          maxWidth: '95vw',
          maxHeight: '95vh',
          panelClass: 'cierre-modal-panel',
          data: {
            idAtencion: item.idAtencion,
            idExpediente: item.idExpediente,
            expediente: item.expediente
          },
          disableClose: false
        });

        dialogRef.afterClosed().subscribe((result) => {
          console.log('📋 [AtencionCierre] Modal de cierre cerrado:', result);
          if (result?.success) {
            this.cargarDatos();
          }
        });
      }
    });
  }
}

