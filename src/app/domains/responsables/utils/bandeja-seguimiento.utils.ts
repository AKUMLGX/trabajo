import { ExpedienteTlalcalli } from '../../capture/interfaces/expediente-tlalcalli.interface';
import { DateUtils } from '../../capture/utils/date-utils';
import {
  NivelPrioridadAsunto,
  ORDEN_NIVEL_PRIORIDAD_ASUNTO,
  clasificarPrioridadAsunto,
} from '../../capture/utils/prioridad-asunto.utils';
import { FiltrosResponsable } from '../services/responsables.service';

export type VistaBandeja = 'pendientes' | 'atendidos';

export interface ConteoSemaforo {
  en_tiempo: number;
  urgente: number;
  extra_urgente: number;
  vencido: number;
}

/** Estatus que pasan a «Atendidos»; todo lo demás aparece en «Por atender». */
export const ESTATUS_ATENDIDOS = ['ATENDIDO', 'CONOCIMIENTO', 'CANCELADO'];

export const ETIQUETAS_NIVEL_PRIORIDAD: Record<string, string> = {
  EN_TIEMPO: 'En tiempo',
  URGENTE: 'Urgente',
  EXTRA_URGENTE: 'Extra urgente',
  VENCIDO: 'Vencido',
};

/** Subcadenas en `responsable` para el modo «vista equipo» (filtro local sobre el listado global). */
const RESPONSABLES_EQUIPO_SUBSTR = ['irma', 'karen', 'hector', 'carlos'];

export function esAtendido(expediente: ExpedienteTlalcalli): boolean {
  return ESTATUS_ATENDIDOS.includes((expediente.estatus || '').toUpperCase());
}

export function filtrarPorVista(expedientes: ExpedienteTlalcalli[], vista: VistaBandeja): ExpedienteTlalcalli[] {
  return expedientes.filter((e) => (vista === 'atendidos' ? esAtendido(e) : !esAtendido(e)));
}

export function esResponsableEquipoCaptura(expediente: ExpedienteTlalcalli): boolean {
  const responsable = (expediente.responsable || '').trim().toLowerCase();
  return !!responsable && RESPONSABLES_EQUIPO_SUBSTR.some((n) => responsable.includes(n));
}

/** Cuerpo para POST expedientes_rework/data_busqueda. */
export function construirFiltrosConsulta(filtros: FiltrosResponsable): Record<string, unknown> {
  const texto = (filtros.oficio || filtros.expediente || '').trim();
  return {
    oficio: texto,
    expediente: texto,
    remitente_area: filtros.remitente_area || '',
    fecha_creacion_desde: filtros.fecha_desde || '',
    fecha_creacion_hasta: filtros.fecha_hasta || '',
  };
}

/** Rework devuelve fechas DD/MM/YYYY; `new Date()` directo produce NaN. */
function fechaBaseExpediente(expediente: ExpedienteTlalcalli): Date | null {
  for (const valor of [expediente.fecha_creacion, expediente.fecha_recibido, expediente.fecha_asignacion]) {
    const fecha = DateUtils.parseFechaLocal(valor as string | Date | null | undefined);
    if (fecha) return fecha;
  }
  return null;
}

export function aplicarFiltrosLocales(expedientes: ExpedienteTlalcalli[], filtros: FiltrosResponsable): ExpedienteTlalcalli[] {
  let filas = [...expedientes];

  if (filtros.estatus) {
    const estatus = filtros.estatus.toUpperCase();
    filas = filas.filter((e) => (e.estatus || '').toUpperCase() === estatus);
  }

  const texto = (filtros.oficio || filtros.expediente || '').trim().toLowerCase();
  if (texto) {
    filas = filas.filter((e) =>
      [e.oficio, e.expediente, e.referencia_asunto, e.remitente_area].some((v) => (v || '').toLowerCase().includes(texto))
    );
  } else if (filtros.remitente_area) {
    const remitente = filtros.remitente_area.trim().toLowerCase();
    filas = filas.filter((e) => (e.remitente_area || '').toLowerCase().includes(remitente));
  }

  if (filtros.fecha_desde || filtros.fecha_hasta) {
    const desde = filtros.fecha_desde ? new Date(filtros.fecha_desde + 'T00:00:00') : null;
    const hasta = filtros.fecha_hasta ? new Date(filtros.fecha_hasta + 'T23:59:59') : null;
    filas = filas.filter((e) => {
      const fecha = fechaBaseExpediente(e);
      return !!fecha && (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
    });
  }

  return filas;
}

/** Más urgentes primero; a igual nivel, el de mayor porcentaje de tiempo consumido. */
export function ordenarPorPrioridad(expedientes: ExpedienteTlalcalli[]): ExpedienteTlalcalli[] {
  return [...expedientes].sort((a, b) => {
    const sa = clasificarPrioridadAsunto(a);
    const sb = clasificarPrioridadAsunto(b);
    const diferencia = (ORDEN_NIVEL_PRIORIDAD_ASUNTO[sa.nivel] ?? 4) - (ORDEN_NIVEL_PRIORIDAD_ASUNTO[sb.nivel] ?? 4);
    return diferencia !== 0 ? diferencia : sb.porcentaje - sa.porcentaje;
  });
}

export function contarSemaforo(expedientes: ExpedienteTlalcalli[]): ConteoSemaforo {
  const conteo: ConteoSemaforo = { en_tiempo: 0, urgente: 0, extra_urgente: 0, vencido: 0 };
  const clave: Record<NivelPrioridadAsunto, keyof ConteoSemaforo> = {
    EN_TIEMPO: 'en_tiempo',
    URGENTE: 'urgente',
    EXTRA_URGENTE: 'extra_urgente',
    VENCIDO: 'vencido',
  };
  for (const e of expedientes) {
    conteo[clave[clasificarPrioridadAsunto(e).nivel]]++;
  }
  return conteo;
}
