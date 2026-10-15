import { ExpedienteTlalcalli } from '../../capture/interfaces/expediente-tlalcalli.interface';
import { DateUtils } from '../../capture/utils/date-utils';
import { EstadisticasPorEstatus } from './dashboard.service';
import { MetricasServidor } from './metricas-panel.service';
import {
  BUCKETS_ESTATUS,
  BucketEstatus,
  ETIQUETAS_BUCKET_ESTATUS,
  bucketEstatus,
  normalizarTextoCatalogo,
} from './dashboard-estatus-negocio.utils';
import {
  CatalogoRemitenteAdmin,
  ETIQUETA_SIN_DATO_ADMIN,
  etiquetaAdministracionCentral,
  etiquetaAdministracionGeneral,
} from './dashboard-remitente-admin.utils';

export type VistaAdministracionRemitente = 'general' | 'central';

/** Mismas reglas que la bandeja de Seguimiento y Asignación. */
export const ESTATUS_ATENDIDOS = ['ATENDIDO', 'CONOCIMIENTO', 'CANCELADO'];

export const UMBRAL_DIAS_SIN_ATENDER = 90;

/** Fechas en formato YYYY-MM-DD (hora local). */
export interface RangoFechas {
  desde: string;
  hasta: string;
}

export interface AreaPeriodo {
  area: string;
  total: number;
  porBucket: Record<BucketEstatus, number>;
}

export interface ServicioDetalle {
  servicio: string;
  cantidad: number;
}

export const ETIQUETA_SIN_SERVICIO = 'Sin servicio';

/** Indicadores de las solicitudes cuya fecha del documento cae en el rango seleccionado. */
export interface PanelPeriodo {
  rango: RangoFechas;
  capturadas: number;
  porAtender: number;
  atendidos: number;
  cancelados: number;
  sinFechaDocumento: number;
  porBucketEstatus: Record<BucketEstatus, number>;
  porEstatusDetalle: EstadisticasPorEstatus[];
  porAdministracionGeneral: AreaPeriodo[];
  porAdministracionCentral: AreaPeriodo[];
  /** Un renglón por servicio del catálogo (incluye los que tienen 0) más cualquier valor capturado fuera de él. */
  porServicio: ServicioDetalle[];
  /** Días desde la fecha del documento hasta hoy, promedio de las atendidas (estimado). */
  promedioDiasAtencion: number | null;
  atendidasConFecha: number;
  expedientes: ExpedienteTlalcalli[];
}

export interface ExpedienteSinAtender {
  id_expediente: number;
  expediente: string;
  oficio: string;
  remitente: string;
  servicio: string;
  estatus: string;
  responsable: string;
  fecha_documento: string;
  dias: number;
}

export interface PanelSinAtender {
  umbralDias: number;
  items: ExpedienteSinAtender[];
}

export interface PanelDatos {
  /** Catálogo usado para etiquetas de administración en gráficas y exportación. */
  catalogoRemitente?: CatalogoRemitenteAdmin | null;
  periodo: PanelPeriodo;
  sinAtender: PanelSinAtender;
  /** Indicadores de todo el universo desde `GET metricas`; null si el back no respondió. */
  metricas: MetricasServidor | null;
  generado: Date;
}

export interface FuentesPanel {
  expedientes: ExpedienteTlalcalli[];
  /** Nombres vigentes de cat_servicio, en el orden del catálogo. */
  serviciosCatalogo: string[];
  metricas: MetricasServidor | null;
}

const MS_DIA = 1000 * 60 * 60 * 24;

export function fechaDocumento(e: ExpedienteTlalcalli): Date | null {
  return DateUtils.parseFechaLocal(e.fecha_documento as string | Date | null | undefined);
}

export function fechaIso(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function rangoHoy(ahora = new Date()): RangoFechas {
  const hoy = fechaIso(ahora);
  return { desde: hoy, hasta: hoy };
}

export function rangoAnioActual(ahora = new Date()): RangoFechas {
  return {
    desde: fechaIso(new Date(ahora.getFullYear(), 0, 1)),
    hasta: fechaIso(ahora),
  };
}

export function etiquetaRango(rango: RangoFechas): string {
  const formato = (iso: string) => {
    const f = DateUtils.parseFechaLocal(iso);
    return f ? f.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : iso;
  };
  return rango.desde === rango.hasta ? formato(rango.desde) : `${formato(rango.desde)} al ${formato(rango.hasta)}`;
}

/** Ambos extremos incluidos; si el rango viene invertido se corrige. */
export function filtrarPorFechaDocumento(lista: ExpedienteTlalcalli[], rango: RangoFechas): ExpedienteTlalcalli[] {
  let desde = DateUtils.parseFechaLocal(rango.desde);
  let hasta = DateUtils.parseFechaLocal(rango.hasta);
  if (!desde || !hasta) {
    return [];
  }
  if (desde.getTime() > hasta.getTime()) {
    [desde, hasta] = [hasta, desde];
  }
  return lista.filter((e) => {
    const f = fechaDocumento(e);
    return !!f && f.getTime() >= desde!.getTime() && f.getTime() <= hasta!.getTime();
  });
}

function diasEntre(desde: Date, hasta: Date): number {
  const inicio = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate()).getTime();
  return Math.max(0, Math.floor((inicio - desde.getTime()) / MS_DIA));
}

function bucketsEstatusVacios(): Record<BucketEstatus, number> {
  return Object.fromEntries(BUCKETS_ESTATUS.map((b) => [b, 0])) as Record<BucketEstatus, number>;
}

function etiquetaAgrupacionAdministracion(
  e: ExpedienteTlalcalli,
  vista: VistaAdministracionRemitente,
  catalogo: CatalogoRemitenteAdmin | null
): string {
  const etiqueta =
    vista === 'general'
      ? etiquetaAdministracionGeneral(e, catalogo)
      : etiquetaAdministracionCentral(e, catalogo);
  return etiqueta.replace(/\s+/g, ' ').trim() || ETIQUETA_SIN_DATO_ADMIN;
}

function porAdministracionDesdeLista(
  lista: ExpedienteTlalcalli[],
  vista: VistaAdministracionRemitente,
  catalogo: CatalogoRemitenteAdmin | null
): AreaPeriodo[] {
  const mapa = new Map<string, AreaPeriodo>();
  for (const e of lista) {
    const area = etiquetaAgrupacionAdministracion(e, vista, catalogo);
    const fila = mapa.get(area) ?? { area, total: 0, porBucket: bucketsEstatusVacios() };
    fila.total++;
    fila.porBucket[bucketEstatus(e.estatus)]++;
    mapa.set(area, fila);
  }
  return Array.from(mapa.values()).sort((a, b) => b.total - a.total);
}

function porServicioDesdeLista(lista: ExpedienteTlalcalli[], serviciosCatalogo: string[]): ServicioDetalle[] {
  const mapa = new Map<string, ServicioDetalle>();
  for (const servicio of serviciosCatalogo) {
    const clave = normalizarTextoCatalogo(servicio);
    if (clave && !mapa.has(clave)) mapa.set(clave, { servicio: servicio.trim(), cantidad: 0 });
  }
  for (const e of lista) {
    const servicio = (e.servicio || '').trim() || ETIQUETA_SIN_SERVICIO;
    const clave = normalizarTextoCatalogo(servicio);
    const fila = mapa.get(clave) ?? { servicio, cantidad: 0 };
    fila.cantidad++;
    mapa.set(clave, fila);
  }
  return Array.from(mapa.values()).sort((a, b) => b.cantidad - a.cantidad);
}

function periodoDesdeLista(
  todos: ExpedienteTlalcalli[],
  rango: RangoFechas,
  ahora: Date,
  catalogoRemitente: CatalogoRemitenteAdmin | null = null,
  serviciosCatalogo: string[] = []
): PanelPeriodo {
  const lista = filtrarPorFechaDocumento(todos, rango);
  const pendientes = lista.filter((e) => !estaAtendido(e));
  const porBucketEstatus = bucketsEstatusVacios();
  for (const e of lista) {
    porBucketEstatus[bucketEstatus(e.estatus)]++;
  }

  const diasAtendidas = lista
    .filter((e) => bucketEstatus(e.estatus) === 'ATENDIDA')
    .map((e) => fechaDocumento(e))
    .filter((f): f is Date => !!f)
    .map((f) => diasEntre(f, ahora));

  return {
    rango,
    capturadas: lista.length,
    porAtender: pendientes.length,
    atendidos: lista.length - pendientes.length,
    cancelados: porBucketEstatus.CANCELADO,
    sinFechaDocumento: todos.filter((e) => !fechaDocumento(e)).length,
    porBucketEstatus,
    porEstatusDetalle: porEstatusDesdeLista(lista),
    porAdministracionGeneral: porAdministracionDesdeLista(lista, 'general', catalogoRemitente),
    porAdministracionCentral: porAdministracionDesdeLista(lista, 'central', catalogoRemitente),
    porServicio: porServicioDesdeLista(lista, serviciosCatalogo),
    promedioDiasAtencion: diasAtendidas.length
      ? Math.round(diasAtendidas.reduce((acc, d) => acc + d, 0) / diasAtendidas.length)
      : null,
    atendidasConFecha: diasAtendidas.length,
    expedientes: lista,
  };
}

/** Pendientes de todo el universo cuya fecha del documento supera el umbral, del más antiguo al más reciente. */
function sinAtenderDesdeLista(todos: ExpedienteTlalcalli[], ahora: Date): PanelSinAtender {
  const items = todos
    .filter((e) => !estaAtendido(e))
    .map((e) => ({ e, f: fechaDocumento(e) }))
    .filter((x): x is { e: ExpedienteTlalcalli; f: Date } => !!x.f)
    .map(({ e, f }) => ({ e, f, dias: diasEntre(f, ahora) }))
    .filter(({ dias }) => dias >= UMBRAL_DIAS_SIN_ATENDER)
    .sort((a, b) => b.dias - a.dias)
    .map(({ e, f, dias }) => ({
      id_expediente: e.id_expediente ?? 0,
      expediente: e.expediente,
      oficio: e.oficio || '',
      remitente: e.remitente_area || '',
      servicio: e.servicio || '',
      estatus: e.estatus || 'SIN ESTATUS',
      responsable: e.responsable || 'Sin responsable',
      fecha_documento: fechaIso(f),
      dias,
    }));
  return { umbralDias: UMBRAL_DIAS_SIN_ATENDER, items };
}

export function estaAtendido(e: ExpedienteTlalcalli): boolean {
  const s = (e.estatus || '').toUpperCase();
  return !!s && ESTATUS_ATENDIDOS.includes(s);
}

function porEstatusDesdeLista(lista: ExpedienteTlalcalli[]): EstadisticasPorEstatus[] {
  const conteo = new Map<string, number>();
  for (const e of lista) {
    const k = (e.estatus || 'SIN ESTATUS').toUpperCase();
    conteo.set(k, (conteo.get(k) ?? 0) + 1);
  }
  return Array.from(conteo.entries())
    .map(([estatus, cantidad]) => ({
      estatus,
      cantidad,
      porcentaje: lista.length ? Math.round((cantidad / lista.length) * 100) : 0,
    }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

/**
 * Indicadores y gráficas usan solo las solicitudes del rango (fecha del documento);
 * la alerta de 90 días revisa todo el universo de pendientes.
 */
export function construirPanel(
  fuentes: FuentesPanel,
  ahora = new Date(),
  rango = rangoHoy(ahora),
  catalogoRemitente: CatalogoRemitenteAdmin | null = null
): PanelDatos {
  const todos = fuentes.expedientes;
  return {
    catalogoRemitente,
    periodo: periodoDesdeLista(todos, rango, ahora, catalogoRemitente, fuentes.serviciosCatalogo),
    sinAtender: sinAtenderDesdeLista(todos, ahora),
    metricas: fuentes.metricas,
    generado: ahora,
  };
}

/** Mensaje cuando los indicadores del servidor faltan completos o en parte; null si llegaron bien. */
export function avisoMetricasServidor(metricas: MetricasServidor | null): string | null {
  if (!metricas) {
    return 'No se pudieron cargar los indicadores del servidor (GET metricas). El resto del panel se calcula con las solicitudes consultadas.';
  }
  if (!metricas.vencidos) {
    return 'Vencidos y expedientes críticos no están disponibles: hay expedientes con la fecha de recepción en un formato distinto a DD/MM/AAAA.';
  }
  return null;
}

export function formatearHoras(horas: number | null | undefined): string {
  if (horas === null || horas === undefined || Number.isNaN(horas)) {
    return '—';
  }
  if (horas < 48) {
    return `${Math.round(horas)} h`;
  }
  const dias = Math.floor(horas / 24);
  return dias === 1 ? '1 día' : `${dias} días`;
}

/** Filas de los críticos del servidor para Excel / PDF. */
export function filasCriticosServidor(metricas: MetricasServidor | null): (string | number)[][] {
  return (metricas?.criticos ?? []).map((c) => [
    c.expediente,
    c.oficio,
    c.responsable,
    c.estatus,
    Math.round(c.horas),
    formatearHoras(c.horas),
  ]);
}

export function agrupacionAdministracionPeriodo(
  per: PanelPeriodo,
  vista: VistaAdministracionRemitente
): AreaPeriodo[] {
  return vista === 'general' ? per.porAdministracionGeneral : per.porAdministracionCentral;
}

export function formatearDias(dias: number | null): string {
  if (dias === null) {
    return '—';
  }
  return dias === 1 ? '1 día' : `${dias} días`;
}

/** Columnas de estatus con al menos una solicitud en el periodo (para tablas y reportes). */
export function bucketsEstatusActivosEnPeriodo(per: PanelPeriodo): BucketEstatus[] {
  return BUCKETS_ESTATUS.filter((b) => per.porBucketEstatus[b] > 0);
}

/** Filas del desglose administración × grupo de estatus (Excel / PDF / PPTX). */
export function filasTablaPorAdministracionEstatus(
  p: PanelDatos,
  vista: VistaAdministracionRemitente
): { encabezados: string[]; filas: (string | number)[][] } {
  const per = p.periodo;
  const buckets = BUCKETS_ESTATUS;
  const tituloCol = vista === 'general' ? 'Administración General' : 'Administración Central';
  const encabezados = [tituloCol, 'Total', ...buckets.map((b) => ETIQUETAS_BUCKET_ESTATUS[b])];
  const agrupacion = agrupacionAdministracionPeriodo(per, vista);
  const filas = agrupacion.map((a) => [a.area, a.total, ...buckets.map((b) => a.porBucket[b])]);
  return { encabezados, filas };
}

export function soloAdministracionSinDato(per: PanelPeriodo, vista: VistaAdministracionRemitente): boolean {
  const agrupacion = agrupacionAdministracionPeriodo(per, vista);
  return (
    per.capturadas > 0 &&
    agrupacion.length > 0 &&
    agrupacion.every((a) => a.area === ETIQUETA_SIN_DATO_ADMIN)
  );
}

/** Filas de resumen compartidas por Excel, PDF y presentación. */
export function filasResumenPeriodo(p: PanelDatos): (string | number)[][] {
  const per = p.periodo;
  const filas: (string | number)[][] = [
    ['Solicitudes capturadas (fecha del documento)', per.capturadas],
    ['Por atender', per.porAtender],
    ['Atendidas (incluye conocimiento y canceladas)', per.atendidos],
    ['Canceladas', per.cancelados],
    ['Tiempo promedio de atención (estimado)', formatearDias(per.promedioDiasAtencion)],
    [`Sin atender ${p.sinAtender.umbralDias}+ días (todo el universo)`, p.sinAtender.items.length],
  ];
  const vencidos = p.metricas?.vencidos;
  if (p.metricas && vencidos) {
    filas.push(
      ['Vencidos (servidor, todo el universo)', vencidos.vencidos],
      ['Antigüedad promedio de vencidos (servidor)', formatearHoras(vencidos.promedioHoras)],
      ['Expedientes críticos (servidor)', p.metricas.criticos.length],
    );
  }
  return filas;
}
