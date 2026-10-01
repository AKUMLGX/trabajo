import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  Especialista,
  EspecialistaPayload,
  GRUPOS_ESPECIALISTA,
  GrupoEspecialista,
  SeguimientoAsignacionService,
} from '../../services/seguimiento-asignacion.service';

@Component({
  selector: 'app-catalogo-especialistas',
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './catalogo-especialistas.component.html',
})
export class CatalogoEspecialistasComponent {
  /** Catálogo completo (activos e inactivos); lo administra el componente padre. */
  @Input({ required: true }) especialistas: Especialista[] = [];
  @Output() especialistasChange = new EventEmitter<Especialista[]>();

  readonly grupos = GRUPOS_ESPECIALISTA;

  nuevo: EspecialistaPayload = this.nuevoVacio();
  enEdicion: number | null = null;
  edicion: EspecialistaPayload = this.nuevoVacio();
  procesando = false;

  constructor(
    private seguimientoService: SeguimientoAsignacionService,
    private snackBar: MatSnackBar
  ) {}

  private nuevoVacio(grupo: GrupoEspecialista = 'ANALISTA'): EspecialistaPayload {
    return { nombre_completo: '', grupo, etiqueta: '' };
  }

  delGrupo(grupo: GrupoEspecialista): Especialista[] {
    return this.especialistas.filter((e) => e.grupo === grupo);
  }

  agregar(): void {
    if (!this.nuevo.nombre_completo.trim() || this.procesando) {
      return;
    }
    this.procesando = true;
    this.seguimientoService.crearEspecialista(this.nuevo).subscribe({
      next: (creado) => {
        this.procesando = false;
        this.emitir([...this.especialistas, creado]);
        this.nuevo = this.nuevoVacio(this.nuevo.grupo);
        this.snackBar.open(`${creado.nombre_completo} agregado.`, 'Cerrar', { duration: 3000 });
      },
      error: (err: HttpErrorResponse) => this.mostrarError(err, 'No se pudo agregar el registro.'),
    });
  }

  editar(e: Especialista): void {
    this.enEdicion = e.id_especialista;
    this.edicion = { nombre_completo: e.nombre_completo, grupo: e.grupo, etiqueta: e.etiqueta ?? '', activo: e.activo };
  }

  descartarEdicion(): void {
    this.enEdicion = null;
  }

  guardarEdicion(e: Especialista): void {
    this.actualizar(e, this.edicion, () => (this.enEdicion = null));
  }

  alternarActivo(e: Especialista): void {
    this.actualizar(e, {
      nombre_completo: e.nombre_completo,
      grupo: e.grupo,
      etiqueta: e.etiqueta,
      activo: !e.activo,
    });
  }

  private actualizar(e: Especialista, datos: EspecialistaPayload, alTerminar?: () => void): void {
    if (this.procesando) {
      return;
    }
    this.procesando = true;
    this.seguimientoService.actualizarEspecialista(e.id_especialista, datos).subscribe({
      next: (actualizado) => {
        this.procesando = false;
        this.emitir(this.especialistas.map((x) => (x.id_especialista === actualizado.id_especialista ? actualizado : x)));
        alTerminar?.();
      },
      error: (err: HttpErrorResponse) => this.mostrarError(err, 'No se pudo actualizar el registro.'),
    });
  }

  private emitir(lista: Especialista[]): void {
    this.especialistas = lista;
    this.especialistasChange.emit(lista);
  }

  private mostrarError(err: HttpErrorResponse, porDefecto: string): void {
    this.procesando = false;
    this.snackBar.open(err.error?.mensaje || porDefecto, 'Cerrar', { duration: 5000 });
  }
}
