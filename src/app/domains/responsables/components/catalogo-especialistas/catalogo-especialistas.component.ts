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
import {
  LONGITUD_MAXIMA_CORREO,
  errorCorreo,
  esCorreoSatValido,
  normalizarCorreo,
} from '../../utils/correo-especialista.utils';
import { errorRfc, esRfcValido, normalizarRfc } from '../../utils/rfc-especialista.utils';

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
  readonly longitudMaximaCorreo = LONGITUD_MAXIMA_CORREO;
  readonly errorCorreo = errorCorreo;
  readonly errorRfc = errorRfc;

  nuevo: EspecialistaPayload = this.nuevoVacio();
  enEdicion: number | null = null;
  edicion: EspecialistaPayload = this.nuevoVacio();
  procesando = false;

  constructor(
    private seguimientoService: SeguimientoAsignacionService,
    private snackBar: MatSnackBar
  ) {}

  private nuevoVacio(grupo: GrupoEspecialista = 'ANALISTA'): EspecialistaPayload {
    return { nombre_completo: '', grupo, etiqueta: '', email: '', rfc: '' };
  }

  delGrupo(grupo: GrupoEspecialista): Especialista[] {
    return this.especialistas.filter((e) => e.grupo === grupo);
  }

  esValido(datos: EspecialistaPayload): boolean {
    return !!datos.nombre_completo.trim() && esCorreoSatValido(datos.email) && esRfcValido(datos.rfc);
  }

  private normalizarPayload(datos: EspecialistaPayload): EspecialistaPayload {
    return {
      ...datos,
      email: normalizarCorreo(datos.email),
      rfc: normalizarRfc(datos.rfc),
    };
  }

  agregar(): void {
    if (!this.esValido(this.nuevo) || this.procesando) {
      return;
    }
    this.procesando = true;
    this.seguimientoService.crearEspecialista(this.normalizarPayload(this.nuevo)).subscribe({
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
    this.edicion = {
      nombre_completo: e.nombre_completo,
      grupo: e.grupo,
      etiqueta: e.etiqueta ?? '',
      activo: e.activo,
      email: e.email ?? '',
      rfc: e.rfc ?? '',
    };
  }

  descartarEdicion(): void {
    this.enEdicion = null;
  }

  guardarEdicion(e: Especialista): void {
    if (!this.esValido(this.edicion)) {
      return;
    }
    this.actualizar(e, this.normalizarPayload(this.edicion), () => (this.enEdicion = null));
  }

  alternarActivo(e: Especialista): void {
    if (!esCorreoSatValido(e.email) || !esRfcValido(e.rfc ?? '')) {
      this.editar(e);
      this.snackBar.open(`Completa correo y RFC de ${e.nombre_completo} para guardar el cambio.`, 'Cerrar', {
        duration: 5000,
      });
      return;
    }
    this.actualizar(
      e,
      this.normalizarPayload({
        nombre_completo: e.nombre_completo,
        grupo: e.grupo,
        etiqueta: e.etiqueta,
        activo: !e.activo,
        email: e.email!,
        rfc: e.rfc!,
      })
    );
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
