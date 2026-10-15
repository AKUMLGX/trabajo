import { ExpedienteTlalcalli } from '../interfaces/expediente-tlalcalli.interface';
import { DateUtils } from './date-utils';

/** Niveles de la bandeja Centro de control (alineados al catálogo de captura). */
export type NivelPrioridadAsunto = 'EN_TIEMPO' | 'URGENTE' | 'EXTRA_URGENTE' | 'VENCIDO';

export interface ClasificacionPrioridadAsunto {
  nivel: NivelPrioridadAsunto;
  label: string;
  /** Avance del plazo (días hábiles recepción → vencimiento), 0–100. */
  porcentaje: number;
}

/** cat_prioridad: 1 Normal, 2 Urgente, 3 Extra urgente. */
export function idPrioridadCaptura(prioridad: string | number | null | undefined): 1 | 2 | 3 | null {
  if (prioridad === null || prioridad === undefined || prioridad === '') {
    return null;
  }

  const n = Number(prioridad);
  if (n === 1 || n === 2 || n === 3) {
    return n;
  }

  const texto = String(prioridad).toLowerCase();
  if (texto.includes('extra')) {
    return 3;
  }
  if (texto.includes('urgent')) {
    return 2;
  }
  if (texto.includes('normal')) {
    return 1;
  }

  return null;
}

export function asuntoVencido(expediente: ExpedienteTlalcalli, hoy = new Date()): boolean {
  if (expediente.dias_retraso != null && expediente.dias_retraso > 0) {
    return true;
  }

  const vencimiento = DateUtils.parseFechaLocal(expediente.fecha_vencimiento);
  if (!vencimiento) {
    return false;
  }

  const hoyLocal = DateUtils.parseFechaLocal(hoy) ?? hoy;
  hoyLocal.setHours(0, 0, 0, 0);
  vencimiento.setHours(0, 0, 0, 0);

  return hoyLocal.getTime() > vencimiento.getTime();
}

function avancePlazoHabil(expediente: ExpedienteTlalcalli, hoy = new Date()): number {
  const recepcion = DateUtils.parseFechaLocal(
    expediente.fecha_recibido ?? expediente.fecha_creacion ?? expediente.fecha_documento
  );
  const vencimiento = DateUtils.parseFechaLocal(expediente.fecha_vencimiento);
  const hoyLocal = DateUtils.parseFechaLocal(hoy) ?? hoy;

  if (!recepcion || !vencimiento) {
    return 0;
  }

  const plazoTotal = DateUtils.contarDiasHabilesDesdeRecepcion(recepcion, vencimiento);
  if (!plazoTotal || plazoTotal <= 0) {
    return 0;
  }

  const transcurridos = DateUtils.contarDiasHabilesDesdeRecepcion(recepcion, hoyLocal) ?? 0;
  return Math.min(100, Math.round((transcurridos / plazoTotal) * 100));
}

/**
 * Clasifica un expediente con la misma lógica de negocio que captura:
 * - Vencido: fecha de vencimiento superada.
 * - En tiempo / Urgente / Extra urgente: prioridad capturada (cat_prioridad) mientras no esté vencido.
 */
export function clasificarPrioridadAsunto(
  expediente: ExpedienteTlalcalli,
  hoy = new Date()
): ClasificacionPrioridadAsunto {
  const porcentaje = avancePlazoHabil(expediente, hoy);

  if (asuntoVencido(expediente, hoy)) {
    return { nivel: 'VENCIDO', label: 'Vencido', porcentaje: 100 };
  }

  const id = idPrioridadCaptura(expediente.prioridad);

  if (id === 3) {
    return { nivel: 'EXTRA_URGENTE', label: 'Extra urgente', porcentaje };
  }
  if (id === 2) {
    return { nivel: 'URGENTE', label: 'Urgente', porcentaje };
  }

  return { nivel: 'EN_TIEMPO', label: 'En tiempo', porcentaje };
}

export const ORDEN_NIVEL_PRIORIDAD_ASUNTO: Record<NivelPrioridadAsunto, number> = {
  VENCIDO: 0,
  EXTRA_URGENTE: 1,
  URGENTE: 2,
  EN_TIEMPO: 3,
};
