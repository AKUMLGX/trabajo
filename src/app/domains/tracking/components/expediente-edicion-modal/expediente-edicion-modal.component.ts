import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { ExpedienteTlalcalli } from '../../../../domains/capture/interfaces/expediente-tlalcalli.interface';
import { ExpedienteTlalcalliService } from '../../../../domains/capture/services/expediente-tlalcalli.service';
import {
  ExpedienteDetalleCaptura,
  ExpedienteEdicionFormValores,
} from '../../interfaces/expediente-detalle-captura.interface';
import { ExpedienteCapturaEditFormComponent } from '../expediente-captura-edit-form/expediente-captura-edit-form.component';
import { mensajeErrorPutInicialRework } from '../../../../domains/capture/utils/http-error.utils';

export interface ExpedienteEdicionModalData {
  expediente: ExpedienteTlalcalli;
}

export interface ExpedienteEdicionModalResult {
  guardado: boolean;
}

@Component({
  selector: 'app-expediente-edicion-modal',
  imports: [CommonModule, MatDialogModule, MatButtonModule, ExpedienteCapturaEditFormComponent],
  templateUrl: './expediente-edicion-modal.component.html',
  styleUrl: './expediente-edicion-modal.component.css',
})
export class ExpedienteEdicionModalComponent implements OnInit {
  detalle: ExpedienteDetalleCaptura | null = null;
  cargando = true;
  errorCarga = false;
  guardando = false;
  mensajeApi = '';

  @ViewChild('formEditExpediente') formEditExpediente?: ExpedienteCapturaEditFormComponent;

  constructor(
    public dialogRef: MatDialogRef<ExpedienteEdicionModalComponent, ExpedienteEdicionModalResult>,
    @Inject(MAT_DIALOG_DATA) public data: ExpedienteEdicionModalData,
    private expedienteService: ExpedienteTlalcalliService
  ) {}

  ngOnInit(): void {
    this.expedienteService.obtenerDetalleCaptura(this.data.expediente).subscribe({
      next: (detalle) => {
        this.detalle = detalle;
        this.cargando = false;
      },
      error: () => {
        this.errorCarga = true;
        this.cargando = false;
      },
    });
  }

  subtituloExpediente(): string {
    const num = this.detalle?.expediente ?? this.data.expediente?.expediente ?? '-';
    const oficio = this.detalle?.oficio ?? this.data.expediente?.oficio ?? '-';
    return `${num} · ${oficio}`;
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  solicitarGuardado(): void {
    this.formEditExpediente?.onGuardar();
  }

  onGuardarExpediente(valores: ExpedienteEdicionFormValores): void {
    if (!this.detalle) {
      return;
    }

    const payload = this.expedienteService.construirPayloadReworkEdicionSeguimiento(valores, this.detalle);
    this.guardando = true;
    this.mensajeApi = '';

    if (this.detalle.origen !== 'rework') {
      this.guardando = false;
      this.mensajeApi = 'Solo expedientes rework pueden persistirse en servidor.';
      return;
    }

    this.expedienteService.actualizarExpedienteReworkInicial(payload).subscribe({
      next: () => {
        this.guardando = false;
        this.dialogRef.close({ guardado: true });
      },
      error: (error) => {
        this.guardando = false;
        this.mensajeApi = mensajeErrorPutInicialRework(error);
      },
    });
  }
}
