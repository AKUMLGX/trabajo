import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CierreService } from '../../services/cierre.service';

export interface CierreModalData {
  idAtencion: number;
  idExpediente: number;
  expediente: string;
  cierreExistente?: any;
}

@Component({
    selector: 'app-cierre-modal',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule
    ],
    templateUrl: './cierre-modal.component.html',
    styleUrl: './cierre-modal.component.css'
})
export class CierreModalComponent implements OnInit {
  formulario: FormGroup;
  guardando: boolean = false;
  cargando: boolean = false;

  // Opciones para dropdowns (actualizados según requerimientos)
  estadosRespuesta = ['Pendiente', 'Proceso', 'Atendido'];
  tiposRespuesta = ['Oficio', 'Atenta Nota', 'Correo Electrónico', 'Petición Interna', 'Total', 'Parcial'];

  constructor(
    private fb: FormBuilder,
    private cierreService: CierreService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<CierreModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CierreModalData
  ) {
    this.formulario = this.fb.group({
      // TICKET MS-SAT
      ticketNumero: [''],
      ticketFechaApertura: [''],
      ticketFechaResolucion: [''],
      
      // RESPUESTA
      respuestaEstado: ['Pendiente'],
      respuestaTipo: [''],
      respuestaNumero: [''],
      respuestaFecha: [''],
      
      // NOTIFICACION (solo fecha)
      notificacionFecha: [''],
      
      // DISPOSITIVO (serie y modelo)
      dispositivoSerie: [''],
      dispositivoModelo: [''],
      
      // OBSERVACIONES
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Cargar datos existentes si hay un cierre previo
   */
  cargarDatos(): void {
    if (this.data.cierreExistente) {
      const cierre = this.data.cierreExistente;
      this.formulario.patchValue({
        ticketNumero: cierre.ticket_numero || '',
        ticketFechaApertura: cierre.ticket_fecha_apertura || '',
        ticketFechaResolucion: cierre.ticket_fecha_resolucion || '',
        respuestaEstado: cierre.respuesta_estado || 'Pendiente',
        respuestaTipo: cierre.respuesta_tipo || '',
        respuestaNumero: cierre.respuesta_numero || '',
        respuestaFecha: cierre.respuesta_fecha || '',
        notificacionFecha: cierre.notificacion_fecha || '',
        dispositivoSerie: cierre.dispositivo_serie || '',
        dispositivoModelo: cierre.dispositivo_modelo || '',
        observaciones: cierre.observaciones || ''
      });
    } else {
      // Cargar desde el servicio si no se pasó en data
      this.cargando = true;
      this.cierreService.obtenerCierrePorAtencion(this.data.idAtencion).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const cierre = response.data;
            this.formulario.patchValue({
              ticketNumero: cierre.ticket_numero || '',
              ticketFechaApertura: cierre.ticket_fecha_apertura || '',
              ticketFechaResolucion: cierre.ticket_fecha_resolucion || '',
              respuestaEstado: cierre.respuesta_estado || 'Pendiente',
              respuestaTipo: cierre.respuesta_tipo || '',
              respuestaNumero: cierre.respuesta_numero || '',
              respuestaFecha: cierre.respuesta_fecha || '',
              notificacionFecha: cierre.notificacion_fecha || '',
              dispositivoSerie: cierre.dispositivo_serie || '',
              dispositivoModelo: cierre.dispositivo_modelo || '',
              observaciones: cierre.observaciones || ''
            });
          }
          this.cargando = false;
        },
        error: (error) => {
          console.log('ℹ️ [CierreModal] No hay cierre previo, formulario vacío');
          this.cargando = false;
        }
      });
    }
  }

  /**
   * Guardar el cierre
   */
  guardar(): void {
    if (this.formulario.invalid) {
      this.mostrarError('Por favor, complete todos los campos requeridos');
      return;
    }

    this.guardando = true;
    const formValue = this.formulario.value;

    const dto = {
      id_atencion: this.data.idAtencion,
      id_expediente: this.data.idExpediente,
      ticket_numero: formValue.ticketNumero || null,
      ticket_fecha_apertura: formValue.ticketFechaApertura || null,
      ticket_fecha_resolucion: formValue.ticketFechaResolucion || null,
      respuesta_estado: formValue.respuestaEstado || null,
      respuesta_tipo: formValue.respuestaTipo || null,
      respuesta_numero: formValue.respuestaNumero || null,
      respuesta_fecha: formValue.respuestaFecha || null,
      notificacion_fecha: formValue.notificacionFecha || null,
      dispositivo_serie: formValue.dispositivoSerie || null,
      dispositivo_modelo: formValue.dispositivoModelo || null,
      observaciones: formValue.observaciones || null
    };

    console.log('💾 [CierreModal] Guardando cierre:', dto);

    this.cierreService.guardarCierre(dto).subscribe({
      next: (response) => {
        console.log('✅ [CierreModal] Cierre guardado:', response);
        this.guardando = false;
        this.mostrarExito('Cierre guardado correctamente');
        this.dialogRef.close({ success: true, data: response.data });
      },
      error: (error) => {
        console.error('❌ [CierreModal] Error al guardar:', error);
        this.guardando = false;
        this.mostrarError('Error al guardar el cierre');
      }
    });
  }

  /**
   * Cerrar el modal
   */
  cerrar(): void {
    this.dialogRef.close();
  }

  /**
   * Mostrar mensaje de éxito
   */
  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }

  /**
   * Mostrar mensaje de error
   */
  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
}

