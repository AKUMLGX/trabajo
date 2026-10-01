import { ExpedienteTlalcalli } from '../../capture/interfaces/expediente-tlalcalli.interface';
import { DateUtils } from '../../capture/utils/date-utils';
import { EstadoCierre, ResumenCierre } from '../../responsables/services/cierre-rework.service';
import { AlertaCompromiso, ResumenSeguimiento } from '../../responsables/services/seguimiento-asignacion.service';
import {
  DashboardCompleto,
  EstadisticasPorEstatus,
  EstadisticasPorResponsable,
  EstadisticasPorTipoAccion,
  ExpedienteCritico,
  SemaforoPrioridades,
  TendenciaSemanal,
} from './dashboard.service';

/** Mismas reglas que la bandeja de Seguimiento y Asignación. */
export const ESTATUS_ATENDIDOS = ['ATENDIDO', 'CONOCIMIENTO', 'CANCELADO'];
export const LIMITE_HORAS_SEMAFORO = 72;

export const ETIQUETAS_CIERRE: Record<EstadoCierre, string> = {
  SIN_REGISTRO: 'Sin evidencia',
  PARCIAL: 'Respuesta parcial',
  TOTAL: 'Respuesta total',
  COMPLETO: 'Cierre completo',
};

export const ESTADOS_CIERRE: EstadoCierre[] = ['SIN_REGISTRO', 'PARCIAL', 'TOTAL', 'COMPLETO'];

export type OrigenDatos = 'bandejas' | 'estadisticas';

export interface PanelKpis {
  total: number;
  porAtender: number;
  atendidos: number;
  criticos: number;
  responsables: number;
  promedioHorasPendientes: number;
  semaforo: SemaforoPrioridades;
}

export interface PanelGraficas {
  porEstatus: EstadisticasPorEstatus[];
  porResponsable: EstadisticasPorResponsable[];
  tendencia: TendenciaSemanal[];
  porTipoAccion: EstadisticasPorTipoAccion[];
}

export interface PanelCaptura {
  total: number;
  hoy: number;
  ultimos7: number;
  ultimos30: number;
}

export interface PanelConsulta {
  total: number;
  topEstatus: EstadisticasPorEstatus[];
}

export interface PanelSeguimiento {
  conSeguimiento: number;
  ticketsAbiertos: number;
  wosAbiertos: number;
  compromisosVencidos: number;
  alertas: number;
  urgentes: number;
  vencidos: number;
}

export interface PanelCierre {
  total: number;
  pendientes: number;
  conteos: Record<EstadoCierre, number>;
}

export interface PanelDatos {
  origen: OrigenDatos;
  kpis: PanelKpis;
  graficas: PanelGraficas;
  captura: PanelCaptura;
  consulta: PanelConsulta;
  seguimiento: PanelSeguimiento;
  cierre: PanelCierre;
  criticos: ExpedienteCritico[];
  alertas: AlertaCompromiso[];
  generado: Date;
}

export interface FuentesPanel {
  estadisticas: DashboardCompleto;
  expedientes: ExpedienteTlalcalli[];
  resumenSeguimiento: ResumenSeguimiento[];
  alertas: AlertaCompromiso[];
  resumenCierre: ResumenCierre[];
}

const MS_HORA = 1000 * 60 * 60;
const MS_DIA = MS_HORA * 24;

function fechaBase(e: ExpedienteTlalcalli): Date | null {
  for (const valor of [e.fecha_creacion, e.fecha_recibido, e.fecha_asignacion]) {
    const fecha = DateUtils.parseFechaLocal(valor as string | Date | null | undefined);
    if (fecha) {
      return fecha;
    }
  }
  return null;
}

export function horasDesdeCaptura(e: ExpedienteTlalcalli, ahora: Date): number {
  const base = fechaBase(e) ?? ahora;
  const horas = Math.floor((ahora.getTime() - base.getTime()) / MS_HORA);
  return Number.isFinite(horas) ? Math.max(0, horas) : 0;
}

export function estaAtendido(e: ExpedienteTlalcalli): boolean {
  const s = (e.estatus || '').toUpperCase();
  return !!s && ESTATUS_ATENDIDOS.includes(s);
}

function responsablesDe(e: ExpedienteTlalcalli): string[] {
  return (e.responsable || '')
    .split(';')
    .map((r) => r.trim())
    .filter(Boolean);
}

/** Clave de semana igual a `TO_CHAR(fecha, 'YYYY-WW')` de PostgreSQL. */
function claveSemana(fecha: Date): string {
  const inicioAnio = new Date(fecha.getFullYear(), 0, 1);
  const diaDelAnio = Math.floor((fecha.getTime() - inicioAnio.getTime()) / MS_DIA) + 1;
  const semana = Math.floor((diaDelAnio - 1) / 7) + 1;
  return `${fecha.getFullYear()}-${String(semana).padStart(2, '0')}`;
}

function calcularSemaforo(lista: ExpedienteTlalcalli[], ahora: Date): SemaforoPrioridades {
  const semaforo: SemaforoPrioridades = { en_tiempo: 0, atencion: 0, urgente: 0, vencido: 0 };
  for (const e of lista) {
    const horas = horasDesdeCaptura(e, ahora);
    if (horas >= LIMITE_HORAS_SEMAFORO) semaforo.vencido++;
    else if (horas >= 48) semaforo.urgente++;
    else if (horas >= 24) semaforo.atencion++;
    else semaforo.en_tiempo++;
  }
  return semaforo;
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

function porResponsableDesdeLista(lista: ExpedienteTlalcalli[]): EstadisticasPorResponsable[] {
  const mapa = new Map<string, EstadisticasPorResponsable>();
  for (const e of lista) {
    const atendido = estaAtendido(e);
    for (const nombre of responsablesDe(e)) {
      const fila = mapa.get(nombre) ?? { responsable: nombre, total: 0, pendientes: 0, atendidos: 0 };
      fila.total++;
      if (atendido) fila.atendidos++;
      else fila.pendientes++;
      mapa.set(nombre, fila);
    }
  }
  return Array.from(mapa.values()).sort((a, b) => b.total - a.total);
}

function tendenciaDesdeLista(
  lista: ExpedienteTlalcalli[],
  api: TendenciaSemanal[],
  ahora: Date
): TendenciaSemanal[] {
  const atendidosApi = new Map(api.map((t) => [t.semana, t.atendidos]));
  const semanas: TendenciaSemanal[] = [];
  for (let i = 3; i >= 0; i--) {
    const semana = claveSemana(new Date(ahora.getTime() - i * 7 * MS_DIA));
    if (!semanas.some((s) => s.semana === semana)) {
      semanas.push({ semana, creados: 0, atendidos: atendidosApi.get(semana) ?? 0 });
    }
  }
  for (const e of lista) {
    const base = fechaBase(e);
    if (!base) continue;
    const fila = semanas.find((s) => s.semana === claveSemana(base));
    if (fila) fila.creados++;
  }
  return semanas;
}

function criticosDesdeLista(pendientes: ExpedienteTlalcalli[], ahora: Date): ExpedienteCritico[] {
  return pendientes
    .map((e) => ({ e, horas: horasDesdeCaptura(e, ahora) }))
    .filter(({ horas }) => horas >= 48)
    .sort((a, b) => b.horas - a.horas)
    .slice(0, 10)
    .map(({ e, horas }) => ({
      id_expediente: e.id_expediente ?? 0,
      expediente: e.expediente,
      oficio: e.oficio ?? null,
      responsable: e.responsable || 'Sin responsable',
      estatus: e.estatus || 'SIN ESTATUS',
      horas_transcurridas: horas,
    }));
}

function capturaDesdeLista(lista: ExpedienteTlalcalli[], ahora: Date): PanelCaptura {
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
  const resultado: PanelCaptura = { total: lista.length, hoy: 0, ultimos7: 0, ultimos30: 0 };
  for (const e of lista) {
    const base = fechaBase(e);
    if (!base) continue;
    const dias = Math.floor((hoy - base.getTime()) / MS_DIA);
    if (dias <= 0) resultado.hoy++;
    if (dias < 7) resultado.ultimos7++;
    if (dias < 30) resultado.ultimos30++;
  }
  return resultado;
}

function seguimientoDesdeFuentes(
  resumen: ResumenSeguimiento[],
  alertas: AlertaCompromiso[],
  semaforo: SemaforoPrioridades
): PanelSeguimiento {
  return {
    conSeguimiento: resumen.filter((r) => r.acciones_registradas > 0).length,
    ticketsAbiertos: resumen.reduce((acc, r) => acc + (r.tickets_abiertos || 0), 0),
    wosAbiertos: resumen.reduce((acc, r) => acc + (r.wos_abiertos || 0), 0),
    compromisosVencidos: resumen.reduce((acc, r) => acc + (r.compromisos_vencidos || 0), 0),
    alertas: alertas.length,
    urgentes: semaforo.urgente,
    vencidos: semaforo.vencido,
  };
}

function cierreDesdeFuentes(lista: ExpedienteTlalcalli[], resumen: ResumenCierre[]): PanelCierre {
  const porExpediente = new Map(resumen.map((r) => [r.id_expediente, r]));
  const conteos: Record<EstadoCierre, number> = { SIN_REGISTRO: 0, PARCIAL: 0, TOTAL: 0, COMPLETO: 0 };
  const conId = lista.filter((e) => !!e.id_expediente);
  for (const e of conId) {
    conteos[porExpediente.get(e.id_expediente!)?.estado_cierre ?? 'SIN_REGISTRO']++;
  }
  return { total: conId.length, pendientes: conId.length - conteos.COMPLETO, conteos };
}

/** Panel calculado con el listado rework, el mismo que usan las bandejas. */
function panelDesdeBandejas(f: FuentesPanel, ahora: Date): PanelDatos {
  const lista = f.expedientes;
  const pendientes = lista.filter((e) => !estaAtendido(e));
  const semaforo = calcularSemaforo(lista, ahora);
  const sumaHoras = pendientes.reduce((acc, e) => acc + horasDesdeCaptura(e, ahora), 0);
  const porEstatus = porEstatusDesdeLista(lista);
  const porResponsable = porResponsableDesdeLista(lista);

  return {
    origen: 'bandejas',
    kpis: {
      total: lista.length,
      porAtender: pendientes.length,
      atendidos: lista.length - pendientes.length,
      criticos: semaforo.urgente + semaforo.vencido,
      responsables: porResponsable.length,
      promedioHorasPendientes: pendientes.length ? Math.round(sumaHoras / pendientes.length) : 0,
      semaforo,
    },
    graficas: {
      porEstatus,
      porResponsable,
      tendencia: tendenciaDesdeLista(lista, f.estadisticas.tendencia_semanal, ahora),
      porTipoAccion: f.estadisticas.por_tipo_accion,
    },
    captura: capturaDesdeLista(lista, ahora),
    consulta: { total: lista.length, topEstatus: porEstatus.slice(0, 3) },
    seguimiento: seguimientoDesdeFuentes(f.resumenSeguimiento, f.alertas, semaforo),
    cierre: cierreDesdeFuentes(lista, f.resumenCierre),
    criticos: criticosDesdeLista(pendientes, ahora),
    alertas: ordenarAlertas(f.alertas),
    generado: ahora,
  };
}

/** Respaldo cuando el listado de bandejas no devuelve registros. */
function panelDesdeEstadisticas(f: FuentesPanel, ahora: Date): PanelDatos {
  const d = f.estadisticas;
  const g = d.generales;
  const atendidos = g.en_atencion + g.atendidos_total + g.rechazados;
  return {
    origen: 'estadisticas',
    kpis: {
      total: g.total_expedientes,
      porAtender: Math.max(0, g.total_expedientes - atendidos),
      atendidos,
      criticos: d.semaforo.urgente + d.semaforo.vencido,
      responsables: g.responsables_activos,
      promedioHorasPendientes: g.promedio_horas_atencion,
      semaforo: d.semaforo,
    },
    graficas: {
      porEstatus: d.por_estatus,
      porResponsable: d.por_responsable,
      tendencia: [...d.tendencia_semanal].reverse(),
      porTipoAccion: d.por_tipo_accion,
    },
    captura: { total: g.total_expedientes, hoy: 0, ultimos7: 0, ultimos30: 0 },
    consulta: { total: g.total_expedientes, topEstatus: d.por_estatus.slice(0, 3) },
    seguimiento: seguimientoDesdeFuentes(f.resumenSeguimiento, f.alertas, d.semaforo),
    cierre: cierreDesdeFuentes([], f.resumenCierre),
    criticos: d.expedientes_criticos,
    alertas: ordenarAlertas(f.alertas),
    generado: ahora,
  };
}

function ordenarAlertas(alertas: AlertaCompromiso[]): AlertaCompromiso[] {
  return [...alertas].sort((a, b) => b.dias_vencido - a.dias_vencido);
}

/** Mismo formato que el "Tiempo promedio" de la bandeja de Seguimiento. */
export function formatearDuracion(horas: number): string {
  const h = Math.max(0, Math.round(horas));
  if (h < 24) {
    return `${h} h`;
  }
  const dias = Math.floor(h / 24);
  const resto = h % 24;
  return resto ? `${dias}d ${resto}h` : `${dias}d`;
}

export function construirPanel(fuentes: FuentesPanel, ahora = new Date()): PanelDatos {
  return fuentes.expedientes.length > 0
    ? panelDesdeBandejas(fuentes, ahora)
    : panelDesdeEstadisticas(fuentes, ahora);
}

function celdaCsv(valor: string | number): string {
  const texto = String(valor ?? '');
  return /[",\n;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function panelACsv(p: PanelDatos): string {
  const filas: (string | number)[][] = [
    ['Panel Estadístico Tlálcalli'],
    ['Generado', p.generado.toLocaleString('es-MX')],
    ['Origen de datos', p.origen === 'bandejas' ? 'Bandejas operativas' : 'Servicio de estadísticas'],
    [],
    ['Sección', 'Indicador', 'Valor'],
    ['General', 'Total expedientes', p.kpis.total],
    ['General', 'Por atender', p.kpis.porAtender],
    ['General', 'Atendidos', p.kpis.atendidos],
    ['General', 'Críticos (urgentes + vencidos)', p.kpis.criticos],
    ['General', 'Responsables', p.kpis.responsables],
    ['General', 'Tiempo promedio pendientes (h)', p.kpis.promedioHorasPendientes],
    ['Captura', 'Capturados hoy', p.captura.hoy],
    ['Captura', 'Últimos 7 días', p.captura.ultimos7],
    ['Captura', 'Últimos 30 días', p.captura.ultimos30],
    ...p.consulta.topEstatus.map((e) => ['Consulta', `Estatus ${e.estatus}`, e.cantidad]),
    ['Seguimiento', 'En tiempo (0-24 h)', p.kpis.semaforo.en_tiempo],
    ['Seguimiento', 'Atención (24-48 h)', p.kpis.semaforo.atencion],
    ['Seguimiento', 'Urgente (48-72 h)', p.kpis.semaforo.urgente],
    ['Seguimiento', 'Vencido (+72 h)', p.kpis.semaforo.vencido],
    ['Seguimiento', 'Expedientes con seguimiento', p.seguimiento.conSeguimiento],
    ['Seguimiento', 'Tickets abiertos', p.seguimiento.ticketsAbiertos],
    ['Seguimiento', 'WO abiertos', p.seguimiento.wosAbiertos],
    ['Seguimiento', 'Compromisos vencidos', p.seguimiento.compromisosVencidos],
    ...ESTADOS_CIERRE.map((e) => ['Atención / cierre', ETIQUETAS_CIERRE[e], p.cierre.conteos[e]]),
    ['Atención / cierre', 'Pendientes de cierre', p.cierre.pendientes],
    [],
    ['Carga por responsable'],
    ['Responsable', 'Total', 'Pendientes', 'Atendidos'],
    ...p.graficas.porResponsable.map((r) => [r.responsable, r.total, r.pendientes, r.atendidos]),
    [],
    ['Expedientes críticos'],
    ['Expediente', 'Oficio', 'Responsable', 'Estatus', 'Horas desde captura'],
    ...p.criticos.map((c) => [c.expediente, c.oficio ?? '', c.responsable, c.estatus, Math.round(c.horas_transcurridas)]),
    [],
    ['Alertas de compromiso'],
    ['Expediente', 'Tipo', 'Número', 'Fecha compromiso', 'Días vencido'],
    ...p.alertas.map((a) => [a.num_expediente, a.tipo, a.numero, a.fecha_compromiso, a.dias_vencido]),
  ];
  return '\uFEFF' + filas.map((fila) => fila.map(celdaCsv).join(',')).join('\r\n');
}
