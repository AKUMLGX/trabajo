import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmacionModalData {
  titulo: string;
  mensaje: string;
  detalle?: string;
  tipo?: 'success' | 'info' | 'warning' | 'error';
  botonTexto?: string;
}

@Component({
  selector: 'app-confirmacion-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './confirmacion-modal.component.html',
  styleUrl: './confirmacion-modal.component.css'
})
export class ConfirmacionModalComponent {
  titulo: string;
  mensaje: string;
  detalle?: string;
  tipo: 'success' | 'info' | 'warning' | 'error';
  botonTexto: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmacionModalData
  ) {
    this.titulo = data.titulo || 'Confirmación';
    this.mensaje = data.mensaje || '';
    this.detalle = data.detalle;
    this.tipo = data.tipo || 'info';
    this.botonTexto = data.botonTexto || 'Aceptar';
  }

  aceptar() {
    this.dialogRef.close(true);
  }
}







