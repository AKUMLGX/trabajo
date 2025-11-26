import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ExpedienteEncontrado {
  id_expediente: number;
  expediente: string;
  fecha_creacion: string;
  estatus: string;
  remitente_area: string;
  referencia_asunto: string;
  responsable?: string;
  sistema_aplicativo?: string;
  ubicacion?: string;
  fecha_documento?: string;
  fecha_recibido?: string;
  numero_entrada_central?: string;
  [key: string]: any; // Para campos adicionales
}

export interface ExpedientesModalData {
  oficio: string;
  expedientes: ExpedienteEncontrado[];
  total: number;
}

@Component({
  selector: 'app-expedientes-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './expedientes-modal.component.html',
  styleUrl: './expedientes-modal.component.css'
})
export class ExpedientesModalComponent {
  oficio: string;
  expedientes: ExpedienteEncontrado[];
  total: number;
  expedienteSeleccionado: ExpedienteEncontrado | null = null;

  constructor(
    public dialogRef: MatDialogRef<ExpedientesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExpedientesModalData
  ) {
    this.oficio = data.oficio;
    this.expedientes = data.expedientes || [];
    this.total = data.total || 0;
  }

  seleccionarExpediente(expediente: ExpedienteEncontrado) {
    this.expedienteSeleccionado = expediente;
    this.dialogRef.close(expediente);
  }

  cerrarSinSeleccionar() {
    this.dialogRef.close(null);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  }

  formatearEstatus(estatus: string): string {
    const estatusMap: { [key: string]: string } = {
      'EN_TRAMITE': 'En Trámite',
      'ATENDIDO': 'Atendido',
      'PENDIENTE': 'Pendiente',
      'CANCELADO': 'Cancelado'
    };
    return estatusMap[estatus] || estatus;
  }
}

