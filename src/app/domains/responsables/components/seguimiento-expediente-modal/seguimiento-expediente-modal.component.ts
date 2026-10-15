import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ExpedienteTlalcalli } from '../../../capture/interfaces/expediente-tlalcalli.interface';
import { CatalogoReworkItem } from '../../../capture/interfaces/expediente-rework.interface';
import { CatalogoReworkCacheService } from '../../../capture/services/catalogo-rework-cache.service';
import { ExpedienteTlalcalliService } from '../../../capture/services/expediente-tlalcalli.service';
import { DateUtils } from '../../../capture/utils/date-utils';
import { parsearRemitenteCompuesto } from '../../../dashboard/services/dashboard-remitente-admin.utils';
import {
  ExpedienteDetalleCaptura,
  OficioAdjuntoExpediente,
} from '../../../tracking/interfaces/expediente-detalle-captura.interface';
import { ExpedienteDetalleModalComponent } from '../../../tracking/components/expediente-detalle-modal/expediente-detalle-modal.component';
import { CierreRework, CierreReworkService } from '../../services/cierre-rework.service';
import {
  Especialista,
  FolioEntregable,
  GRUPOS_ESPECIALISTA,
  ItemCompromiso,
  ResumenSeguimiento,
  SeguimientoAcciones,
  SeguimientoAsignacionService,
  compromisoVencido,
} from '../../services/seguimiento-asignacion.service';
import { fusionarCatalogoConSemillaCorrelacion } from '../../utils/correlacion-especialistas.utils';
import { EtapaAtencion, etapaAtencion } from '../../utils/etapa-atencion.utils';
import {
  FolioEntregableLocal,
  foliosAnterioresSinDuplicar,
  parseAnexosEntregables,
} from '../../utils/entregable-folio.utils';
import { EtiquetaEstatusPipe } from '../../../shared/pipes/etiqueta-estatus.pipe';

export interface SeguimientoExpedienteModalData {
  expediente: ExpedienteTlalcalli;
}

type OrigenEvento = 'CONSULTA' | 'SEGUIMIENTO' | 'CIERRE';

interface EventoSeguimiento {
  fecha: Date;
  origen: OrigenEvento;
  icono: string;
  titulo: string;
  detalle?: string;
}

interface GrupoAsignado {
  titulo: string;
  nombres: string[];
}

interface AccionRegistrada {
  titulo: string;
  valores: string[];
}

interface FolioVista {
  folio: string;
  tipo: string;
  estado: 'ACTIVO' | 'CANCELADO';
  fecha?: string | null;
  motivo?: string | null;
}

const ORIGENES_EVENTO: Record<OrigenEvento, { etiqueta: string; punto: string; chip: string }> = {
  CONSULTA: { etiqueta: 'Consulta', punto: 'bg-tlalcalli-primary', chip: 'tl-chip-primary' },
  SEGUIMIENTO: { etiqueta: 'Seguimiento y asignación', punto: 'bg-tlalcalli-warning', chip: 'tl-chip-warning' },
  CIERRE: { etiqueta: 'Atención y cierre', punto: 'bg-tlalcalli-success', chip: 'tl-chip-success' },
};

type ClaveAccion = 'oficio_solicitud_info' | 'oficio_comision_apoyo' | 'oficio_designacion_aceptacion' | 'actas_hechos_memorias';

const ACCIONES_SEGUIMIENTO: { clave: ClaveAccion; titulo: string }[] = [
  { clave: 'oficio_solicitud_info', titulo: 'Solicitud / entrega de información' },
  { clave: 'oficio_comision_apoyo', titulo: 'Comisión / apoyo' },
  { clave: 'oficio_designacion_aceptacion', titulo: 'Designación / aceptación' },
  { clave: 'actas_hechos_memorias', titulo: 'Actas y reportes' },
];

const SIN_REGISTRO = 'Sin registro';

@Component({
  selector: 'app-seguimiento-expediente-modal',
  imports: [EtiquetaEstatusPipe, CommonModule, MatDialogModule],
  templateUrl: './seguimiento-expediente-modal.component.html',
})
export class SeguimientoExpedienteModalComponent implements OnInit {
  readonly expediente: ExpedienteTlalcalli;
  readonly sinRegistro = SIN_REGISTRO;
  readonly origenes = ORIGENES_EVENTO;

  cargando = true;

  detalle: ExpedienteDetalleCaptura | null = null;
  errorConsulta = false;
  adjuntos: OficioAdjuntoExpediente[] = [];

  seguimiento: SeguimientoAcciones | null = null;
  errorSeguimiento = false;
  gruposAsignados: GrupoAsignado[] = [];
  accionesRegistradas: AccionRegistrada[] = [];
  folios: FolioVista[] = [];
  notaAnexos = '';
  /** undefined: el back aún no expone el dato; null: no se ha enviado. */
  fechaCorreoAsignacion: string | null | undefined = undefined;

  cierre: CierreRework | null = null;
  errorCierre = false;
  acuse = '';
  estadoExpediente = '';

  eventos: EventoSeguimiento[] = [];

  constructor(
    public dialogRef: MatDialogRef<SeguimientoExpedienteModalComponent>,
    @Inject(MAT_DIALOG_DATA) data: SeguimientoExpedienteModalData,
    private dialog: MatDialog,
    private expedienteService: ExpedienteTlalcalliService,
    private seguimientoService: SeguimientoAsignacionService,
    private cierreService: CierreReworkService,
    private catalogos: CatalogoReworkCacheService
  ) {
    this.expediente = data.expediente;
  }

  ngOnInit(): void {
    const id = this.expediente.id_expediente;
    forkJoin({
      detalle: this.tolerante(this.expedienteService.obtenerDetalleCaptura(this.expediente)),
      adjuntos: id ? this.tolerante(this.expedienteService.cargarOficiosAdjuntosCompletos(id)) : of([]),
      seguimiento: id ? this.tolerante(this.seguimientoService.obtenerSeguimiento(id)) : of(null),
      especialistas: this.tolerante(this.seguimientoService.obtenerEspecialistas(true)),
      folios: id ? this.tolerante(this.seguimientoService.obtenerFolios(id)) : of([]),
      resumen: this.seguimientoService.obtenerResumen(),
      cierre: id ? this.tolerante(this.cierreService.obtenerCierre(id)) : of(null),
      catAcuse: this.tolerante(this.catalogos.getCat(4)),
      catExpediente: this.tolerante(this.catalogos.getCat(5)),
    }).subscribe(({ detalle, adjuntos, seguimiento, especialistas, folios, resumen, cierre, catAcuse, catExpediente }) => {
      this.detalle = detalle ?? null;
      this.errorConsulta = detalle === undefined;
      this.adjuntos = adjuntos ?? [];

      this.seguimiento = seguimiento ?? null;
      this.errorSeguimiento = seguimiento === undefined;
      this.prepararSeguimiento(especialistas ?? [], folios ?? [], resumen);

      this.cierre = cierre ?? null;
      this.errorCierre = cierre === undefined;
      this.acuse = this.descripcionCatalogo(catAcuse, this.cierre?.acuse);
      this.estadoExpediente = this.descripcionCatalogo(catExpediente, this.cierre?.expediente);

      this.eventos = this.construirLineaDeTiempo();
      this.cargando = false;
    });
  }

  /** undefined marca que la petición falló; null que no hay registro. */
  private tolerante<T>(peticion: Observable<T>): Observable<T | undefined> {
    return peticion.pipe(catchError(() => of(undefined)));
  }

  private descripcionCatalogo(items: CatalogoReworkItem[] | undefined, id: number | null | undefined): string {
    if (id == null) return '';
    return items?.find((i) => i.id_exp === id)?.descripcion ?? '';
  }

  private prepararSeguimiento(especialistas: Especialista[], foliosApi: FolioEntregable[], resumen: ResumenSeguimiento[]): void {
    const id = this.expediente.id_expediente;
    const fila = resumen.find((r) => r.id_expediente === id);
    this.fechaCorreoAsignacion = fila?.fecha_notificacion_asignacion ?? null;

    const anexos = parseAnexosEntregables(this.seguimiento?.anexos);
    this.notaAnexos = anexos.nota;

    const catalogo = fusionarCatalogoConSemillaCorrelacion(especialistas);
    const nombrePorId = new Map(catalogo.map((e) => [e.id_especialista, e.nombre_completo]));
    const asignaciones = this.seguimiento?.asignaciones;
    this.gruposAsignados = GRUPOS_ESPECIALISTA.map(({ clave, titulo, grupo }) => {
      const nombres = (asignaciones?.[clave] ?? []).map((idEsp) => nombrePorId.get(idEsp) ?? `#${idEsp}`);
      if (grupo === 'CORRELACION') nombres.push(...anexos.correlacion_nombres);
      return { titulo, nombres: [...new Set(nombres.map((n) => n.trim()).filter(Boolean))] };
    });

    this.accionesRegistradas = ACCIONES_SEGUIMIENTO.map(({ clave, titulo }) => ({
      titulo,
      valores: (this.seguimiento?.[clave] ?? '')
        .split(';')
        .map((v) => v.trim())
        .filter((v) => v && v.toUpperCase() !== 'N/A'),
    })).filter((a) => a.valores.length > 0);

    this.folios = [
      ...anexos.folios.map((f: FolioEntregableLocal) => ({
        folio: f.folio,
        tipo: f.nombre || f.codigo,
        estado: f.estado,
        fecha: f.creado_en,
        motivo: f.motivo_cancelacion,
      })),
      ...foliosAnterioresSinDuplicar(foliosApi, anexos.folios).map((f) => ({
        folio: f.folio,
        tipo: f.tipo === 'DICTAMEN' ? 'Dictamen' : 'Reporte',
        estado: f.estado,
        fecha: f.fecha_creacion,
        motivo: f.motivo_cancelacion,
      })),
    ];
  }

  private construirLineaDeTiempo(): EventoSeguimiento[] {
    const eventos: EventoSeguimiento[] = [];
    const agregar = (fecha: string | null | undefined, evento: Omit<EventoSeguimiento, 'fecha'>) => {
      const parseada = DateUtils.parseFechaLocal(fecha);
      if (parseada) eventos.push({ ...evento, fecha: parseada });
    };

    const d = this.detalle;
    agregar(d?.fecha_documento, { origen: 'CONSULTA', icono: 'description', titulo: 'Fecha del documento', detalle: d?.oficio });
    agregar(d?.fecha_recepcion, { origen: 'CONSULTA', icono: 'move_to_inbox', titulo: 'Recepción del expediente', detalle: d?.oficio });
    agregar(d?.fecha_vencimiento, { origen: 'CONSULTA', icono: 'event_busy', titulo: 'Vencimiento' });
    for (const a of this.adjuntos) {
      agregar(a.fecha_recepcion || a.fecha_documento, { origen: 'CONSULTA', icono: 'attach_file', titulo: 'Oficio adjunto', detalle: a.num_oficio });
    }

    agregar(this.fechaCorreoAsignacion, { origen: 'SEGUIMIENTO', icono: 'forward_to_inbox', titulo: 'Correo de asignación enviado' });
    for (const f of this.folios) {
      agregar(f.fecha, { origen: 'SEGUIMIENTO', icono: 'confirmation_number', titulo: `Folio ${f.folio}`, detalle: f.tipo });
    }
    for (const [tipo, lista] of [['Ticket', this.seguimiento?.tickets ?? []], ['WOOS', this.seguimiento?.wos ?? []]] as const) {
      for (const item of lista) {
        agregar(item.fecha_apertura, { origen: 'SEGUIMIENTO', icono: 'playlist_add', titulo: `${tipo} ${item.numero} abierto` });
        if (item.cerrado) agregar(item.fecha_cierre, { origen: 'SEGUIMIENTO', icono: 'task_alt', titulo: `${tipo} ${item.numero} cerrado` });
      }
    }
    agregar(this.seguimiento?.fecha_actualizacion, {
      origen: 'SEGUIMIENTO',
      icono: 'manage_accounts',
      titulo: 'Última actualización del seguimiento',
      detalle: this.seguimiento?.usuario_actualizacion ?? undefined,
    });

    for (const [i, p] of (this.cierre?.respuestas_parciales ?? []).entries()) {
      agregar(p.fecha_notificacion, { origen: 'CIERRE', icono: 'mark_email_read', titulo: `Respuesta parcial #${i + 1}`, detalle: p.descripcion });
    }
    agregar(this.cierre?.fecha_notif_total_fisica, { origen: 'CIERRE', icono: 'task', titulo: 'Respuesta total notificada (física)' });
    agregar(this.cierre?.fecha_notif_total_correo, { origen: 'CIERRE', icono: 'task', titulo: 'Respuesta total notificada (correo)' });
    agregar(this.cierre?.fecha_actualizacion, {
      origen: 'CIERRE',
      icono: 'assignment_turned_in',
      titulo: 'Última actualización de atención y cierre',
      detalle: this.cierre?.usuario_actualizacion ?? undefined,
    });

    return eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }

  get etapa(): EtapaAtencion | null {
    return etapaAtencion(this.detalle?.estatus || this.expediente.estatus);
  }

  get remitente(): { principal: string; detalle: string } {
    const crudo = this.detalle?.remitente || this.expediente.remitente_area || '';
    const compuesto = parsearRemitenteCompuesto(crudo);
    if (!compuesto) return { principal: this.texto(crudo), detalle: '' };
    return {
      principal: [compuesto.generalClave, compuesto.centralClave].filter(Boolean).join(' · '),
      detalle: compuesto.identificador,
    };
  }

  get oficiosPrincipales(): string[] {
    return (this.detalle?.oficio || this.expediente.oficio || '').split('|').map((o) => o.trim()).filter(Boolean);
  }

  get tieneAsignados(): boolean {
    return this.gruposAsignados.some((g) => g.nombres.length > 0);
  }

  get compromisos(): { tipo: string; item: ItemCompromiso }[] {
    return [
      ...(this.seguimiento?.tickets ?? []).map((item) => ({ tipo: 'Ticket', item })),
      ...(this.seguimiento?.wos ?? []).map((item) => ({ tipo: 'WOOS', item })),
    ];
  }

  vencido(item: ItemCompromiso): boolean {
    return compromisoVencido(item);
  }

  texto(valor: string | null | undefined): string {
    const limpio = (valor || '').trim();
    return limpio && limpio !== '-' && limpio.toUpperCase() !== 'N/A' ? limpio : SIN_REGISTRO;
  }

  fecha(valor: string | Date | null | undefined): string {
    const formateada = DateUtils.formatearFechaDisplay(valor);
    return formateada === '—' ? SIN_REGISTRO : formateada;
  }

  verDocumentos(): void {
    this.dialog.open(ExpedienteDetalleModalComponent, {
      width: '96vw',
      maxWidth: '1400px',
      height: '92vh',
      maxHeight: '92vh',
      panelClass: 'expediente-detalle-dialog',
      data: { expediente: this.expediente, soloLectura: true },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
