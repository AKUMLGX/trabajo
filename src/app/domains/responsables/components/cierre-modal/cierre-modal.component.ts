import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ExpedienteTlalcalli } from '../../../capture/interfaces/expediente-tlalcalli.interface';
import { CatalogoReworkItem } from '../../../capture/interfaces/expediente-rework.interface';
import { CatalogoReworkCacheService } from '../../../capture/services/catalogo-rework-cache.service';
import { CierreRework, CierreReworkService } from '../../services/cierre-rework.service';

export interface CierreModalData {
  expediente: ExpedienteTlalcalli;
}

@Component({
  selector: 'app-cierre-modal',
  imports: [CommonModule, FormsModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './cierre-modal.component.html',
})
export class CierreModalComponent implements OnInit {
  expediente: ExpedienteTlalcalli;
  cargando = true;
  guardando = false;

  formulario: CierreRework;
  catalogoAcuse: CatalogoReworkItem[] = [];
  catalogoExpediente: CatalogoReworkItem[] = [];

  constructor(
    public dialogRef: MatDialogRef<CierreModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CierreModalData,
    private cierreService: CierreReworkService,
    private catalogos: CatalogoReworkCacheService,
    private snackBar: MatSnackBar
  ) {
    this.expediente = data.expediente;
    this.formulario = this.formularioVacio();
  }

  ngOnInit(): void {
    this.catalogos.getCat(4).subscribe((items) => (this.catalogoAcuse = items));
    this.catalogos.getCat(5).subscribe((items) => (this.catalogoExpediente = items));

    const id = this.expediente.id_expediente;
    if (!id) {
      this.cargando = false;
      return;
    }
    this.cierreService.obtenerCierre(id).subscribe({
      next: (cierre) => {
        if (cierre) {
          this.formulario = {
            ...this.formularioVacio(),
            ...cierre,
            respuestas_parciales: cierre.respuestas_parciales.map((p) => ({ ...p })),
          };
        }
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.snackBar.open('No se pudo cargar la evidencia de cierre.', 'Cerrar', { duration: 4000 });
      },
    });
  }

  private formularioVacio(): CierreRework {
    return {
      id_expediente: this.expediente.id_expediente ?? 0,
      respuestas_parciales: [],
      respuesta_total: '',
      fecha_notif_total_fisica: null,
      fecha_notif_total_correo: null,
      acuse: null,
      expediente: null,
      observaciones: '',
    };
  }

  agregarParcial(): void {
    this.formulario.respuestas_parciales.push({ descripcion: '', fecha_notificacion: null });
  }

  quitarParcial(indice: number): void {
    this.formulario.respuestas_parciales.splice(indice, 1);
  }

  private descripcionAcuse(): string {
    const item = this.catalogoAcuse.find((a) => a.id_exp === this.formulario.acuse);
    return (item?.descripcion || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }

  /** El acuse elegido indica qué fechas de notificación de la respuesta total deberían existir. */
  get advertenciaAcuse(): string | null {
    const acuse = this.descripcionAcuse();
    if (!acuse) {
      return null;
    }
    const faltantes: string[] = [];
    if (acuse.includes('CORREO') && !this.formulario.fecha_notif_total_correo) {
      faltantes.push('por correo');
    }
    if (acuse.includes('FISICAMENTE') && !this.formulario.fecha_notif_total_fisica) {
      faltantes.push('física');
    }
    return faltantes.length ? `Falta la fecha de notificación ${faltantes.join(' y ')} según el acuse.` : null;
  }

  private validar(): string | null {
    for (const [i, parcial] of this.formulario.respuestas_parciales.entries()) {
      if (!parcial.descripcion.trim() && parcial.fecha_notificacion) {
        return `Describe la respuesta parcial #${i + 1} o elimina la fila.`;
      }
    }
    return null;
  }

  guardar(): void {
    const error = this.validar();
    if (error) {
      this.snackBar.open(error, 'Cerrar', { duration: 5000 });
      return;
    }
    this.guardando = true;
    this.cierreService.guardarCierre(this.formulario).subscribe({
      next: () => {
        this.guardando = false;
        this.snackBar.open('Evidencia de cierre guardada.', 'Cerrar', { duration: 3000 });
        this.dialogRef.close({ success: true });
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.snackBar.open(err.error?.mensaje || 'Error al guardar el cierre.', 'Cerrar', { duration: 5000 });
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
