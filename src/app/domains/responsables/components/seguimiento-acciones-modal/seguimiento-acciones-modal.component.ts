import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ExpedienteTlalcalli } from '../../../capture/interfaces/expediente-tlalcalli.interface';
import { CatalogoReworkItem } from '../../../capture/interfaces/expediente-rework.interface';
import { CatalogoReworkCacheService } from '../../../capture/services/catalogo-rework-cache.service';
import { CatalogoEspecialistasComponent } from '../catalogo-especialistas/catalogo-especialistas.component';
import {
  AsignacionesSeguimiento,
  Especialista,
  FolioEntregable,
  GRUPOS_ESPECIALISTA,
  GrupoEspecialista,
  ItemCompromiso,
  OPCIONES_ACTAS,
  OPCIONES_ENTREGABLE,
  OPCIONES_OFICIO_COMISION,
  OPCIONES_OFICIO_DESIGNACION,
  OPCIONES_OFICIO_INFO,
  SeguimientoAcciones,
  SeguimientoAsignacionService,
  compromisoVencido,
} from '../../services/seguimiento-asignacion.service';

interface GrupoOpciones {
  clave: 'oficio_solicitud_info' | 'oficio_comision_apoyo' | 'oficio_designacion_aceptacion' | 'actas_hechos_memorias';
  titulo: string;
  opciones: readonly string[];
}

@Component({
  selector: 'app-seguimiento-acciones-modal',
  imports: [CommonModule, FormsModule, MatDialogModule, MatSnackBarModule, CatalogoEspecialistasComponent],
  templateUrl: './seguimiento-acciones-modal.component.html',
})
export class SeguimientoAccionesModalComponent implements OnInit {
  expediente: ExpedienteTlalcalli;
  cargando = true;
  guardando = false;

  readonly gruposOpciones: GrupoOpciones[] = [
    { clave: 'oficio_solicitud_info', titulo: 'Oficios', opciones: OPCIONES_OFICIO_INFO },
    { clave: 'oficio_comision_apoyo', titulo: 'Oficios', opciones: OPCIONES_OFICIO_COMISION },
    { clave: 'oficio_designacion_aceptacion', titulo: 'Oficios', opciones: OPCIONES_OFICIO_DESIGNACION },
    { clave: 'actas_hechos_memorias', titulo: 'Actas y reportes', opciones: OPCIONES_ACTAS },
  ];
  readonly opcionesEntregable = OPCIONES_ENTREGABLE;

  formulario: SeguimientoAcciones;

  catalogoEstatus: CatalogoReworkItem[] = [];
  estatusSeleccionado: number | null = null;
  private estatusInicial: number | null = null;

  readonly gruposEspecialista = GRUPOS_ESPECIALISTA;
  especialistas: Especialista[] = [];
  mostrarCatalogo = false;

  folios: FolioEntregable[] = [];
  generandoFolio = false;
  folioEnCancelacion: number | null = null;
  motivoCancelacion = '';
  cancelandoFolio = false;

  constructor(
    public dialogRef: MatDialogRef<SeguimientoAccionesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expediente: ExpedienteTlalcalli },
    private seguimientoService: SeguimientoAsignacionService,
    private snackBar: MatSnackBar,
    private catalogos: CatalogoReworkCacheService
  ) {
    this.expediente = data.expediente;
    this.formulario = this.formularioVacio();
  }

  ngOnInit(): void {
    this.catalogos.getCat(3).subscribe((items) => {
      this.catalogoEstatus = items;
      const actual = this.normalizarEstatus(this.expediente.estatus);
      const encontrado = items.find((i) => this.normalizarEstatus(i.descripcion) === actual);
      this.estatusSeleccionado = encontrado?.id_exp ?? null;
      this.estatusInicial = this.estatusSeleccionado;
    });

    this.seguimientoService.obtenerEspecialistas(true).subscribe({
      next: (lista) => (this.especialistas = lista),
      error: () => this.snackBar.open('No se pudo cargar el catálogo de analistas.', 'Cerrar', { duration: 4000 }),
    });

    const id = this.expediente.id_expediente;
    if (!id) {
      this.cargando = false;
      return;
    }
    this.cargarFolios(id);
    this.seguimientoService.obtenerSeguimiento(id).subscribe({
      next: (seguimiento) => {
        if (seguimiento) {
          this.formulario = {
            ...this.formularioVacio(),
            ...seguimiento,
            tickets: seguimiento.tickets.map((t) => ({ ...t })),
            wos: seguimiento.wos.map((w) => ({ ...w })),
            asignaciones: this.copiarAsignaciones(seguimiento.asignaciones),
          };
        }
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.snackBar.open('No se pudo cargar el seguimiento del expediente.', 'Cerrar', { duration: 4000 });
      },
    });
  }

  private formularioVacio(): SeguimientoAcciones {
    return {
      id_expediente: this.expediente.id_expediente ?? 0,
      oficio_solicitud_info: 'N/A',
      oficio_comision_apoyo: 'N/A',
      oficio_designacion_aceptacion: 'N/A',
      actas_hechos_memorias: 'N/A',
      tickets: [],
      wos: [],
      entregable: 'N/A',
      anexos: '',
      asignaciones: this.copiarAsignaciones(),
    };
  }

  private copiarAsignaciones(origen?: Partial<AsignacionesSeguimiento> | null): AsignacionesSeguimiento {
    return {
      analistas: [...(origen?.analistas ?? [])],
      qa_tecnico: [...(origen?.qa_tecnico ?? [])],
      qa_legal: [...(origen?.qa_legal ?? [])],
      qa_interno: [...(origen?.qa_interno ?? [])],
    };
  }

  /** Activos del grupo más los inactivos que ya estaban asignados, para no perderlos de vista. */
  especialistasDeGrupo(grupo: GrupoEspecialista, clave: keyof AsignacionesSeguimiento): Especialista[] {
    const asignados = this.formulario.asignaciones[clave];
    return this.especialistas.filter(
      (e) => e.grupo === grupo && (e.activo || asignados.includes(e.id_especialista))
    );
  }

  estaAsignado(clave: keyof AsignacionesSeguimiento, id: number): boolean {
    return this.formulario.asignaciones[clave].includes(id);
  }

  alternarAsignacion(clave: keyof AsignacionesSeguimiento, id: number): void {
    const lista = this.formulario.asignaciones[clave];
    this.formulario.asignaciones[clave] = lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
  }

  get totalAsignados(): number {
    const a = this.formulario.asignaciones;
    return a.analistas.length + a.qa_tecnico.length + a.qa_legal.length + a.qa_interno.length;
  }

  /** El catálogo trae la variante PEDIENTE; la bandeja la normaliza a PENDIENTE. */
  private normalizarEstatus(valor: string | null | undefined): string {
    const s = (valor || '').trim().toUpperCase();
    return s === 'PEDIENTE' ? 'PENDIENTE' : s;
  }

  etiquetaEstatus(item: CatalogoReworkItem): string {
    return this.normalizarEstatus(item.descripcion) === 'PENDIENTE' ? 'PENDIENTE' : item.descripcion;
  }

  agregarItem(lista: ItemCompromiso[]): void {
    lista.push({ numero: '', fecha_apertura: null, fecha_compromiso: null, cerrado: false, fecha_cierre: null });
  }

  quitarItem(lista: ItemCompromiso[], indice: number): void {
    lista.splice(indice, 1);
  }

  esVencido(item: ItemCompromiso): boolean {
    return compromisoVencido(item);
  }

  get totalVencidos(): number {
    return [...this.formulario.tickets, ...this.formulario.wos].filter((i) => compromisoVencido(i)).length;
  }

  private cargarFolios(idExpediente: number): void {
    this.seguimientoService.obtenerFolios(idExpediente).subscribe({
      next: (folios) => (this.folios = folios),
      error: () => (this.folios = []),
    });
  }

  get tipoFolioEntregable(): 'DICTAMEN' | 'REPORTE' | null {
    const valor = this.formulario.entregable.toUpperCase();
    return valor === 'DICTAMEN' || valor === 'REPORTE' ? valor : null;
  }

  get folioActivoEntregable(): FolioEntregable | null {
    const tipo = this.tipoFolioEntregable;
    return tipo ? this.folios.find((f) => f.tipo === tipo && f.estado === 'ACTIVO') ?? null : null;
  }

  generarFolio(): void {
    const tipo = this.tipoFolioEntregable;
    if (!tipo || this.generandoFolio) {
      return;
    }
    this.generandoFolio = true;
    this.seguimientoService.reservarFolio(this.formulario.id_expediente, tipo).subscribe({
      next: ({ data, nuevo }) => {
        this.generandoFolio = false;
        this.cargarFolios(this.formulario.id_expediente);
        this.snackBar.open(nuevo ? `Folio ${data.folio} generado.` : `Folio activo: ${data.folio}.`, 'Cerrar', {
          duration: 3500,
        });
      },
      error: (err: HttpErrorResponse) => {
        this.generandoFolio = false;
        this.snackBar.open(err.error?.mensaje || 'No se pudo generar el folio.', 'Cerrar', { duration: 5000 });
      },
    });
  }

  iniciarCancelacion(folio: FolioEntregable): void {
    this.folioEnCancelacion = folio.id;
    this.motivoCancelacion = '';
  }

  descartarCancelacion(): void {
    this.folioEnCancelacion = null;
    this.motivoCancelacion = '';
  }

  confirmarCancelacion(folio: FolioEntregable): void {
    const motivo = this.motivoCancelacion.trim();
    if (!motivo) {
      this.snackBar.open('Indica el motivo de cancelación del folio.', 'Cerrar', { duration: 4000 });
      return;
    }
    this.cancelandoFolio = true;
    this.seguimientoService.cancelarFolio(folio.id, motivo).subscribe({
      next: (cancelado) => {
        this.cancelandoFolio = false;
        this.descartarCancelacion();
        this.folios = this.folios.map((f) => (f.id === cancelado.id ? cancelado : f));
        this.snackBar.open(`Folio ${cancelado.folio} cancelado. El número no se reutilizará.`, 'Cerrar', {
          duration: 4000,
        });
      },
      error: (err: HttpErrorResponse) => {
        this.cancelandoFolio = false;
        this.snackBar.open(err.error?.mensaje || 'No se pudo cancelar el folio.', 'Cerrar', { duration: 5000 });
      },
    });
  }

  private validar(): string | null {
    for (const [tipo, lista] of [
      ['Ticket', this.formulario.tickets],
      ['WOOS', this.formulario.wos],
    ] as const) {
      for (const item of lista) {
        if (!item.numero.trim()) {
          return `Captura el número de cada ${tipo} o elimina la fila vacía.`;
        }
        if (item.fecha_apertura && item.fecha_compromiso && item.fecha_compromiso < item.fecha_apertura) {
          return `La fecha compromiso del ${tipo} ${item.numero} es anterior a su apertura.`;
        }
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
    const idExpediente = this.formulario.id_expediente;
    const cambioEstatus$: Observable<unknown> =
      this.estatusSeleccionado !== null && this.estatusSeleccionado !== this.estatusInicial
        ? this.seguimientoService.actualizarEstatus(idExpediente, this.estatusSeleccionado)
        : of(null);

    cambioEstatus$.pipe(switchMap(() => this.seguimientoService.guardarSeguimiento(this.formulario))).subscribe({
      next: (respuesta) => {
        this.guardando = false;
        const mensaje = respuesta.folio
          ? `Seguimiento guardado. Folio de ${this.formulario.entregable.toLowerCase()}: ${respuesta.folio.folio}.`
          : 'Seguimiento guardado correctamente.';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
        this.dialogRef.close({ success: true, estatusActualizado: this.estatusSeleccionado !== this.estatusInicial });
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        const mensaje = err.error?.mensaje || 'Error al guardar el seguimiento.';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
