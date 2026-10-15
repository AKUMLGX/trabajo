import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ExpedienteTlalcalli } from '../../../capture/interfaces/expediente-tlalcalli.interface';
import { ExpedienteTlalcalliService } from '../../../capture/services/expediente-tlalcalli.service';
import { ExpedienteDetalleCaptura } from '../../../tracking/interfaces/expediente-detalle-captura.interface';
import {
  DestinatarioAsignacion,
  Especialista,
  GRUPOS_ESPECIALISTA,
  GrupoEspecialista,
  SeguimientoAcciones,
  SeguimientoAsignacionService,
} from '../../services/seguimiento-asignacion.service';
import { parseAnexosEntregables } from '../../utils/entregable-folio.utils';
import {
  esIdCorrelacionLocal,
  fusionarCatalogoConSemillaCorrelacion,
  listaCorrelacionParaUi,
} from '../../utils/correlacion-especialistas.utils';
import { esCorreoSatValido, normalizarCorreo } from '../../utils/correo-especialista.utils';

export interface NotificarAsignacionModalData {
  expediente: ExpedienteTlalcalli;
}

export interface NotificarAsignacionModalResultado {
  enviado: boolean;
}

interface ArchivoAdjunto {
  id_archivo: number | null;
  nombre: string;
}

/** Persona asignada; solo recibe el aviso si existe en el catálogo y tiene correo válido. */
interface PersonaAsignada {
  id_especialista: number | null;
  nombre: string;
  correo: string | null;
  grupos: GrupoEspecialista[];
}

function mensajeErrorNotificacion(err: HttpErrorResponse): string {
  if (ESTATUS_SIN_ENDPOINT.has(err.status)) {
    return 'El envío de correo aún no está disponible en el servidor.';
  }
  const detalle = String(err.error?.mensaje ?? '');
  if (/duplicate key|unique|creaci[oó]n de notificaci[oó]n/i.test(detalle)) {
    return 'No se pudo registrar. Si este expediente ya se había notificado, el servidor no permite reenviarlo.';
  }
  return 'No se pudo registrar la notificación de asignación.';
}

function esEnviable(p: PersonaAsignada): p is PersonaAsignada & { id_especialista: number; correo: string } {
  return p.id_especialista != null && esCorreoSatValido(p.correo);
}

const ESTATUS_SIN_ENDPOINT = new Set([0, 404, 405, 501]);

const TITULOS_GRUPO = new Map<GrupoEspecialista, string>(GRUPOS_ESPECIALISTA.map((g) => [g.grupo, g.titulo]));

@Component({
  selector: 'app-notificar-asignacion-modal',
  imports: [CommonModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './notificar-asignacion-modal.component.html',
})
export class NotificarAsignacionModalComponent implements OnInit {
  private readonly dialogRef =
    inject<MatDialogRef<NotificarAsignacionModalComponent, NotificarAsignacionModalResultado>>(MatDialogRef);
  private readonly seguimientoService = inject(SeguimientoAsignacionService);
  private readonly expedienteService = inject(ExpedienteTlalcalliService);
  private readonly snackBar = inject(MatSnackBar);

  readonly expediente = inject<NotificarAsignacionModalData>(MAT_DIALOG_DATA).expediente;

  readonly cargando = signal(true);
  readonly enviando = signal(false);
  readonly destinatarios = signal<PersonaAsignada[]>([]);
  readonly archivo = signal<ArchivoAdjunto | null>(null);

  readonly enviables = computed<DestinatarioAsignacion[]>(() =>
    this.destinatarios()
      .filter(esEnviable)
      .map((p) => ({ id_especialista: p.id_especialista, nombre: p.nombre, correo: p.correo, grupos: p.grupos }))
  );
  readonly sinCorreo = computed(() => this.destinatarios().length - this.enviables().length);

  tieneCorreo(persona: PersonaAsignada): boolean {
    return esEnviable(persona);
  }

  ngOnInit(): void {
    const id = this.expediente.id_expediente;
    if (!id) {
      this.cargando.set(false);
      return;
    }
    forkJoin({
      seguimiento: this.seguimientoService.obtenerSeguimiento(id).pipe(catchError(() => of(null))),
      especialistas: this.seguimientoService.obtenerEspecialistas(true).pipe(catchError(() => of([] as Especialista[]))),
      detalle: this.expedienteService
        .obtenerDetalleCaptura(this.expediente)
        .pipe(catchError(() => of(null as ExpedienteDetalleCaptura | null))),
    }).subscribe(({ seguimiento, especialistas, detalle }) => {
      this.destinatarios.set(this.construirDestinatarios(seguimiento, fusionarCatalogoConSemillaCorrelacion(especialistas)));
      this.archivo.set(this.resolverArchivo(detalle));
      this.cargando.set(false);
    });
  }

  tituloGrupos(persona: PersonaAsignada): string {
    return persona.grupos.map((g) => TITULOS_GRUPO.get(g) ?? g).join(' · ');
  }

  private construirDestinatarios(
    seguimiento: SeguimientoAcciones | null,
    catalogo: Especialista[]
  ): PersonaAsignada[] {
    if (!seguimiento) {
      return [];
    }
    const porClave = new Map<string, PersonaAsignada>();
    const agregar = (persona: Especialista, grupo: GrupoEspecialista): void => {
      const idReal = esIdCorrelacionLocal(persona.id_especialista) ? null : persona.id_especialista;
      const clave = idReal != null ? `id-${idReal}` : `nombre-${persona.nombre_completo.trim().toUpperCase()}`;
      const existente = porClave.get(clave);
      if (existente) {
        if (!existente.grupos.includes(grupo)) {
          existente.grupos.push(grupo);
        }
        return;
      }
      porClave.set(clave, {
        id_especialista: idReal,
        nombre: persona.nombre_completo,
        correo: normalizarCorreo(persona.email) || null,
        grupos: [grupo],
      });
    };

    for (const { grupo, clave } of GRUPOS_ESPECIALISTA) {
      for (const id of seguimiento.asignaciones?.[clave] ?? []) {
        const persona = catalogo.find((e) => e.id_especialista === id);
        if (persona) {
          agregar(persona, grupo);
        }
      }
    }

    const correlacionUi = listaCorrelacionParaUi(catalogo);
    for (const nombre of parseAnexosEntregables(seguimiento.anexos).correlacion_nombres) {
      const persona = correlacionUi.find((e) => e.nombre_completo.trim().toUpperCase() === nombre.trim().toUpperCase());
      if (persona) {
        agregar(persona, 'CORRELACION');
      }
    }

    return [...porClave.values()];
  }

  private resolverArchivo(detalle: ExpedienteDetalleCaptura | null): ArchivoAdjunto | null {
    if (!detalle?.tiene_pdf || !detalle.documento_pdf_nombre) {
      return null;
    }
    return { id_archivo: detalle.id_archivo_pdf ?? null, nombre: detalle.documento_pdf_nombre };
  }

  enviar(): void {
    const id = this.expediente.id_expediente;
    const destinatarios = this.enviables();
    if (!id || this.enviando() || !destinatarios.length) {
      return;
    }
    const archivo = this.archivo();
    this.enviando.set(true);
    this.dialogRef.disableClose = true;
    this.seguimientoService
      .notificarAsignacion({
        id_expediente: id,
        num_expediente: this.expediente.expediente ?? '',
        num_oficio: this.expediente.oficio ?? '',
        destinatarios,
        adjuntar_archivo: !!archivo,
        id_archivo: archivo?.id_archivo ?? null,
        nombre_archivo: archivo?.nombre ?? null,
      })
      .subscribe({
        next: (respuesta) => {
          this.enviando.set(false);
          const total = respuesta?.destinatarios_enviados ?? destinatarios.length;
          this.snackBar.open(
            `Notificación registrada para ${total} destinatario(s). El asunto pasó a Atención y cierre.`,
            'Cerrar',
            { duration: 5000 }
          );
          this.dialogRef.close({ enviado: true });
        },
        error: (err: HttpErrorResponse) => {
          this.enviando.set(false);
          this.dialogRef.disableClose = false;
          this.snackBar.open(mensajeErrorNotificacion(err), 'Cerrar', { duration: 6000 });
        },
      });
  }

  cancelar(): void {
    if (!this.enviando()) {
      this.dialogRef.close({ enviado: false });
    }
  }
}
