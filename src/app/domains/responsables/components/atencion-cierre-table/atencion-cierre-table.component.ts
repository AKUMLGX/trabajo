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
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

export interface AtencionCierreItem {
  id: number;
  diasAtraso: number;
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
  // Datos de ejemplo - en producción vendrán del servicio
  items: AtencionCierreItem[] = [
    {
      id: 1,
      diasAtraso: 0,
      ticketNumero: 'TKT-001',
      ticketFechaApertura: new Date('2025-01-15'),
      ticketFechaResolucion: null,
      respuestaEstado: 'Pendiente',
      respuestaTipo: 'Oficio',
      respuestaNumero: '',
      respuestaFecha: null,
      notificacionFecha: null,
      notificacionModelo: '',
      dispositivoSerie: '',
      dispositivoObservaciones: '',
      observaciones: ''
    },
    {
      id: 2,
      diasAtraso: 3,
      ticketNumero: 'TKT-002',
      ticketFechaApertura: new Date('2025-01-12'),
      ticketFechaResolucion: null,
      respuestaEstado: 'En Proceso',
      respuestaTipo: 'Email',
      respuestaNumero: 'RES-001',
      respuestaFecha: new Date('2025-01-14'),
      notificacionFecha: new Date('2025-01-14'),
      notificacionModelo: 'Modelo A',
      dispositivoSerie: 'SER-001',
      dispositivoObservaciones: 'Funcionando correctamente',
      observaciones: 'Requiere seguimiento'
    },
    {
      id: 3,
      diasAtraso: 7,
      ticketNumero: 'TKT-003',
      ticketFechaApertura: new Date('2025-01-08'),
      ticketFechaResolucion: new Date('2025-01-15'),
      respuestaEstado: 'Completado',
      respuestaTipo: 'Oficio',
      respuestaNumero: 'RES-002',
      respuestaFecha: new Date('2025-01-15'),
      notificacionFecha: new Date('2025-01-15'),
      notificacionModelo: 'Modelo B',
      dispositivoSerie: 'SER-002',
      dispositivoObservaciones: '',
      observaciones: 'Proceso completado exitosamente'
    }
  ];

  // Formulario para edición
  editForm: FormGroup;
  editingItemId: number | null = null;

  // Opciones para dropdowns
  estadosRespuesta = ['Pendiente', 'En Proceso', 'Completado', 'Cancelado'];
  tiposRespuesta = ['Oficio', 'Email', 'Telefónica', 'Presencial'];

  constructor(private fb: FormBuilder) {
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
    // Calcular días de atraso para cada item
    this.items.forEach(item => {
      item.diasAtraso = this.calcularDiasAtraso(item.ticketFechaApertura);
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
}

