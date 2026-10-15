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
  OPCIONES_OFICIO_COMISION,
  OPCIONES_OFICIO_DESIGNACION,
  OPCIONES_OFICIO_INFO,
  SeguimientoAcciones,
  SeguimientoAsignacionService,
  compromisoVencido,
} from '../../services/seguimiento-asignacion.service';
import { FoliosEntregableService } from '../../services/folios-entregable.service';
import {
  FolioEntregableLocal,
  SubtipoEntregable,
  folioEntregableDesdeApi,
  foliosAnterioresSinDuplicar,
  parseAnexosEntregables,
  serializarAnexosEntregables,
} from '../../utils/entregable-folio.utils';
import {
  esIdCorrelacionLocal,
  fusionarCatalogoConSemillaCorrelacion,
  listaCorrelacionParaUi,
  nombreCorrelacionDesdeIdLocal,
} from '../../utils/correlacion-especialistas.utils';

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
  subtiposDictamen: SubtipoEntregable[] = [];
  subtiposReporte: SubtipoEntregable[] = [];
  cargandoSubtipos = true;
  /** Código del subtipo cuyo folio se está pidiendo al back. */
  asignandoFolio: string | null = null;
  cancelandoFolioLocal = false;
  /** Folios ya registrados en el back que aún no quedan en el seguimiento guardado. */
  private foliosSinGuardar = 0;

  formulario: SeguimientoAcciones;
  anexosNota = '';
  foliosEntregableLocales: FolioEntregableLocal[] = [];
  folioLocalEnCancelacion: string | null = null;
  /** Correlación por nombre (ids locales o catálogo sin migrar). */
  correlacionNombresSeleccionados: string[] = [];

  catalogoEstatus: CatalogoReworkItem[] = [];
  estatusSeleccionado: number | null = null;
  private estatusInicial: number | null = null;

  /** No se ofrecen en el modal de asignación (solicitud de negocio). */
  private static readonly ESTATUS_OCULTOS_MODAL = new Set([
    'ATENDIDO',
    'CONOCIMIENTO',
    'PENDIENTE',
    'CANCELADO',
    'GESTION DE VIATICOS',
    'EN ESPERA DE FIRMA DEL CENTRAL',
    'PENDIENTE DE NOTIFICACION',
  ]);

  readonly gruposEspecialista = GRUPOS_ESPECIALISTA;
  especialistas: Especialista[] = [];
  mostrarCatalogo = false;

  private readonly separadorOpcionesGrupo = '; ';
  private readonly opcionNaGrupo = 'N/A';

  /** Folios de la tabla anterior `folio_entregable`; solo consulta. */
  private foliosAnteriores: FolioEntregable[] = [];
  motivoCancelacion = '';

  constructor(
    public dialogRef: MatDialogRef<SeguimientoAccionesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expediente: ExpedienteTlalcalli; soloLectura?: boolean },
    private seguimientoService: SeguimientoAsignacionService,
    private snackBar: MatSnackBar,
    private catalogos: CatalogoReworkCacheService,
    private foliosEntregable: FoliosEntregableService
  ) {
    this.expediente = data.expediente;
    this.formulario = this.formularioVacio();
  }

  ngOnInit(): void {
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.disableClose && this.cerrar());
    this.dialogRef.keydownEvents().subscribe((e) => e.key === 'Escape' && this.dialogRef.disableClose && this.cerrar());
    this.foliosEntregable.obtenerSubtipos().subscribe(({ dictamen, reporte }) => {
      this.subtiposDictamen = dictamen;
      this.subtiposReporte = reporte;
      this.cargandoSubtipos = false;
    });

    this.catalogos.getCat(3).subscribe((items) => {
      const actual = this.normalizarEstatus(this.expediente.estatus);
      const encontrado = items.find((i) => this.normalizarEstatus(i.descripcion) === actual);
      this.estatusSeleccionado = encontrado?.id_exp ?? null;
      this.estatusInicial = this.estatusSeleccionado;
      this.catalogoEstatus = this.catalogoEstatusVisible(items, this.estatusSeleccionado);
    });

    this.seguimientoService.obtenerEspecialistas(true).subscribe({
      next: (lista) => (this.especialistas = fusionarCatalogoConSemillaCorrelacion(lista)),
      error: () => {
        this.especialistas = fusionarCatalogoConSemillaCorrelacion([]);
        this.snackBar.open('Catálogo parcial: correlación disponible con lista fija.', 'Cerrar', { duration: 4000 });
      },
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
          this.hidratarEntregablesDesdeAnexos(this.formulario.anexos);
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
      correlacion: [...(origen?.correlacion ?? [])],
    };
  }

  /** Activos del grupo más los inactivos que ya estaban asignados, para no perderlos de vista. */
  especialistasDeGrupo(grupo: GrupoEspecialista, clave: keyof AsignacionesSeguimiento): Especialista[] {
    if (grupo === 'CORRELACION') {
      return listaCorrelacionParaUi(this.especialistas).filter(
        (e) => e.activo || this.estaAsignado(clave, e.id_especialista)
      );
    }
    const asignados = this.formulario.asignaciones[clave];
    return this.especialistas.filter(
      (e) => e.grupo === grupo && (e.activo || asignados.includes(e.id_especialista))
    );
  }

  estaAsignado(clave: keyof AsignacionesSeguimiento, id: number): boolean {
    if (clave === 'correlacion' && esIdCorrelacionLocal(id)) {
      const nombre = nombreCorrelacionDesdeIdLocal(id);
      return nombre
        ? this.correlacionNombresSeleccionados.some((n) => n.toUpperCase() === nombre.toUpperCase())
        : false;
    }
    return this.formulario.asignaciones[clave].includes(id);
  }

  alternarAsignacion(clave: keyof AsignacionesSeguimiento, id: number): void {
    if (clave === 'correlacion' && esIdCorrelacionLocal(id)) {
      const nombre = nombreCorrelacionDesdeIdLocal(id);
      if (!nombre) {
        return;
      }
      const upper = nombre.toUpperCase();
      const ya = this.correlacionNombresSeleccionados.some((n) => n.toUpperCase() === upper);
      this.correlacionNombresSeleccionados = ya
        ? this.correlacionNombresSeleccionados.filter((n) => n.toUpperCase() !== upper)
        : [...this.correlacionNombresSeleccionados, nombre];
      this.persistirEntregablesEnFormulario();
      return;
    }
    const lista = this.formulario.asignaciones[clave];
    this.formulario.asignaciones[clave] = lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
    if (clave === 'correlacion') {
      this.persistirEntregablesEnFormulario();
    }
  }

  get totalAsignados(): number {
    const a = this.formulario.asignaciones;
    const correlacionIdsReales = a.correlacion.filter((id) => !esIdCorrelacionLocal(id)).length;
    const correlacionPorNombre = this.correlacionNombresSeleccionados.length;
    return (
      a.analistas.length +
      a.qa_tecnico.length +
      a.qa_legal.length +
      a.qa_interno.length +
      correlacionIdsReales +
      correlacionPorNombre
    );
  }

  /** El catálogo trae la variante PEDIENTE; la bandeja la normaliza a PENDIENTE. */
  private normalizarEstatus(valor: string | null | undefined): string {
    const s = (valor || '').trim().toUpperCase();
    return s === 'PEDIENTE' ? 'PENDIENTE' : s;
  }

  private claveEstatusComparacion(valor: string | null | undefined): string {
    return this.normalizarEstatus(valor)
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private debeOcultarEstatusModal(descripcion: string): boolean {
    return SeguimientoAccionesModalComponent.ESTATUS_OCULTOS_MODAL.has(this.claveEstatusComparacion(descripcion));
  }

  /** Filtra opciones del select; conserva el estatus actual del expediente si estaba oculto. */
  private catalogoEstatusVisible(items: CatalogoReworkItem[], idSeleccionado: number | null): CatalogoReworkItem[] {
    const visibles = items.filter((i) => !this.debeOcultarEstatusModal(i.descripcion));
    if (idSeleccionado == null) {
      return visibles;
    }
    const actual = items.find((i) => i.id_exp === idSeleccionado);
    if (actual && !visibles.some((v) => v.id_exp === idSeleccionado)) {
      return [actual, ...visibles];
    }
    return visibles;
  }

  etiquetaEstatus(item: CatalogoReworkItem): string {
    return this.normalizarEstatus(item.descripcion) === 'PENDIENTE' ? 'PENDIENTE' : item.descripcion;
  }

  opcionesGrupoSeleccionadas(clave: GrupoOpciones['clave']): string[] {
    const raw = (this.formulario[clave] || '').trim();
    if (!raw || raw === this.opcionNaGrupo) {
      return [this.opcionNaGrupo];
    }
    if (raw.includes(';')) {
      const partes = raw.split(';').map((s) => s.trim()).filter(Boolean);
      return partes.length ? partes : [this.opcionNaGrupo];
    }
    return [raw];
  }

  estaOpcionGrupoActiva(clave: GrupoOpciones['clave'], opcion: string): boolean {
    return this.opcionesGrupoSeleccionadas(clave).includes(opcion);
  }

  alternarOpcionGrupo(clave: GrupoOpciones['clave'], opcion: string): void {
    if (opcion === this.opcionNaGrupo) {
      this.formulario[clave] = this.opcionNaGrupo;
      return;
    }

    const sinNa = this.opcionesGrupoSeleccionadas(clave).filter((o) => o !== this.opcionNaGrupo);
    const indice = sinNa.indexOf(opcion);
    if (indice >= 0) {
      sinNa.splice(indice, 1);
    } else {
      sinNa.push(opcion);
    }

    if (sinNa.length === 0) {
      this.formulario[clave] = this.opcionNaGrupo;
      return;
    }

    this.formulario[clave] = sinNa.join(this.separadorOpcionesGrupo);
  }

  agregarItem(lista: ItemCompromiso[]): void {
    lista.push({ numero: '', fecha_apertura: null, fecha_compromiso: null, cerrado: false, fecha_cierre: null });
  }

  /** Al cerrar el ticket/WOOS se bloquean los demás campos; la fecha de cierre queda en el día actual (sin campo en UI). */
  alCambiarCerradoItem(item: ItemCompromiso, cerrado: boolean): void {
    if (item.cerrado) {
      return;
    }
    if (!cerrado) {
      return;
    }
    item.cerrado = true;
    item.fecha_cierre = this.fechaHoyLocal();
  }

  private fechaHoyLocal(): string {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
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
      next: (folios) => (this.foliosAnteriores = folios),
      error: () => (this.foliosAnteriores = []),
    });
  }

  get foliosAnterioresVisibles(): FolioEntregable[] {
    return foliosAnterioresSinDuplicar(this.foliosAnteriores, this.foliosEntregableLocales);
  }

  get entregableEsNa(): boolean {
    return !this.foliosEntregableLocales.some((f) => f.estado === 'ACTIVO');
  }

  private hidratarEntregablesDesdeAnexos(anexos: string): void {
    const { folios, nota, correlacion_nombres } = parseAnexosEntregables(anexos);
    this.foliosEntregableLocales = folios;
    this.anexosNota = nota;
    this.correlacionNombresSeleccionados = correlacion_nombres;
    this.sincronizarCampoEntregable();
  }

  /** Con 'Dictamen' o 'Reporte', el PUT de seguimiento reserva otro folio en `folio_entregable`; la lista real va en `anexos`. */
  private sincronizarCampoEntregable(): void {
    this.formulario.entregable = 'N/A';
  }

  private persistirEntregablesEnFormulario(): void {
    this.sincronizarCampoEntregable();
    this.formulario.anexos = serializarAnexosEntregables(
      this.foliosEntregableLocales,
      this.anexosNota,
      this.correlacionNombresSeleccionados
    );
  }

  private prepararAsignacionesParaGuardar(): void {
    this.formulario.asignaciones.correlacion = this.formulario.asignaciones.correlacion.filter(
      (id) => !esIdCorrelacionLocal(id)
    );
  }

  marcarEntregableNa(): void {
    const activos = this.foliosEntregableLocales.filter((f) => f.estado === 'ACTIVO');
    if (activos.length) {
      this.snackBar.open('Cancela los folios activos antes de marcar N/A.', 'Cerrar', { duration: 4500 });
      return;
    }
    this.persistirEntregablesEnFormulario();
  }

  agregarFolioEntregable(subtipo: SubtipoEntregable): void {
    const idExpediente = this.expediente.id_expediente;
    if (!idExpediente || this.asignandoFolio) {
      return;
    }
    this.asignandoFolio = subtipo.codigo;
    this.foliosEntregable.asignarFolio(subtipo, idExpediente).subscribe({
      next: (folio) => {
        this.asignandoFolio = null;
        this.foliosEntregableLocales = [...this.foliosEntregableLocales, folioEntregableDesdeApi(subtipo, folio)];
        this.marcarFoliosSinGuardar();
        this.persistirEntregablesEnFormulario();
        this.snackBar.open(`Folio ${folio} asignado. Guarda el seguimiento para conservarlo en el expediente.`, 'Cerrar', {
          duration: 4500,
        });
      },
      error: (err: HttpErrorResponse) => {
        this.asignandoFolio = null;
        this.snackBar.open(err.error?.mensaje || `No se pudo asignar el folio ${subtipo.codigo}.`, 'Cerrar', { duration: 5000 });
      },
    });
  }

  /** Mientras haya folios sin guardar, clic fuera o Esc pasan por `cerrar()` para avisar. */
  private marcarFoliosSinGuardar(): void {
    this.foliosSinGuardar++;
    this.dialogRef.disableClose = true;
  }

  conteoFoliosActivosPorCodigo(codigo: string): number {
    return this.foliosEntregableLocales.filter((f) => f.codigo === codigo && f.estado === 'ACTIVO').length;
  }

  iniciarCancelacionFolioLocal(idLocal: string): void {
    this.folioLocalEnCancelacion = idLocal;
    this.motivoCancelacion = '';
  }

  descartarCancelacionFolioLocal(): void {
    this.folioLocalEnCancelacion = null;
    this.motivoCancelacion = '';
  }

  confirmarCancelacionFolioLocal(folio: FolioEntregableLocal): void {
    const motivo = this.motivoCancelacion.trim();
    if (!motivo) {
      this.snackBar.open('Indica el motivo de cancelación del folio.', 'Cerrar', { duration: 4000 });
      return;
    }
    const cancelacion$: Observable<void> = folio.registrado_en_servidor
      ? this.foliosEntregable.cancelarFolio(folio.familia, folio.folio)
      : of(undefined);
    this.cancelandoFolioLocal = true;
    cancelacion$.subscribe({
      next: () => {
        this.cancelandoFolioLocal = false;
        this.foliosEntregableLocales = this.foliosEntregableLocales.map((f) =>
          f.idLocal === folio.idLocal ? { ...f, estado: 'CANCELADO', motivo_cancelacion: motivo } : f
        );
        this.marcarFoliosSinGuardar();
        this.descartarCancelacionFolioLocal();
        this.persistirEntregablesEnFormulario();
        this.snackBar.open(`Folio ${folio.folio} cancelado (no se reutiliza el consecutivo). Guarda el seguimiento.`, 'Cerrar', {
          duration: 4500,
        });
      },
      error: (err: HttpErrorResponse) => {
        this.cancelandoFolioLocal = false;
        this.snackBar.open(err.error?.mensaje || `No se pudo cancelar el folio ${folio.folio}.`, 'Cerrar', { duration: 5000 });
      },
    });
  }

  onAnexosNotaChange(): void {
    this.persistirEntregablesEnFormulario();
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

  /** Rol especialista: ve todo el seguimiento sin poder modificarlo. */
  get soloLectura(): boolean {
    return this.data.soloLectura === true;
  }

  guardar(): void {
    if (this.soloLectura) return;
    const error = this.validar();
    if (error) {
      this.snackBar.open(error, 'Cerrar', { duration: 5000 });
      return;
    }
    this.persistirEntregablesEnFormulario();
    this.prepararAsignacionesParaGuardar();
    this.guardando = true;
    const idExpediente = this.formulario.id_expediente;
    const cambioEstatus$: Observable<unknown> =
      this.estatusSeleccionado !== null && this.estatusSeleccionado !== this.estatusInicial
        ? this.seguimientoService.actualizarEstatus(idExpediente, this.estatusSeleccionado)
        : of(null);

    cambioEstatus$.pipe(switchMap(() => this.seguimientoService.guardarSeguimiento(this.formulario))).subscribe({
      next: () => {
        this.guardando = false;
        this.foliosSinGuardar = 0;
        this.snackBar.open('Seguimiento guardado correctamente.', 'Cerrar', { duration: 4000 });
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
    if (
      this.foliosSinGuardar > 0 &&
      !confirm('Hay folios asignados o cancelados que aún no guardas en el seguimiento. Si cierras, el expediente no los mostrará. ¿Cerrar de todos modos?')
    ) {
      return;
    }
    this.dialogRef.close();
  }
}
