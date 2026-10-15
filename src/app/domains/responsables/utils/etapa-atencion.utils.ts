import { etiquetaEstatus, normalizarTextoCatalogo } from '../../shared/utils/catalogo-estatus.utils';

export interface EtapaAtencion {
  etiqueta: string;
  clase: string;
}

/** Claves normalizadas de catalogo_status (getCat/3). */
const ETAPAS: Record<string, EtapaAtencion> = {
  ATENDIDO: { etiqueta: 'Atendido', clase: 'tl-chip-success' },
  CONOCIMIENTO: { etiqueta: 'Conocimiento', clase: 'tl-chip-neutral' },
  CANCELADO: { etiqueta: 'Cancelado', clase: 'tl-chip-error' },
  'EN PROCESO': { etiqueta: 'En proceso', clase: 'tl-chip-primary' },
  'PENDIENTE DE NOTIFICACION': { etiqueta: 'Pendiente de notificación', clase: 'tl-chip-warning' },
  'EN ESPERA DE FIRMA DEL CENTRAL': { etiqueta: 'En espera de firma', clase: 'tl-chip-warning' },
};

export interface OpcionEtapa {
  id: number;
  etiqueta: string;
}

/** Las 6 etapas que se eligen en Atención y cierre, en el orden del formulario, con ids del catálogo real. */
export function opcionesEtapaAtencion(catalogo: { id_exp: number; descripcion: string }[]): OpcionEtapa[] {
  const orden = Object.keys(ETAPAS);
  return catalogo
    .map((i) => ({ id: i.id_exp, etiqueta: etiquetaEstatus(i.descripcion), clave: normalizarTextoCatalogo(i.descripcion) }))
    .filter((i) => orden.includes(i.clave))
    .sort((a, b) => orden.indexOf(a.clave) - orden.indexOf(b.clave))
    .map(({ id, etiqueta }) => ({ id, etiqueta }));
}

export function idEtapaAtencion(opciones: OpcionEtapa[], catalogo: { id_exp: number; descripcion: string }[], estatus: string | null | undefined): number | null {
  const clave = normalizarTextoCatalogo(estatus);
  const item = catalogo.find((i) => normalizarTextoCatalogo(i.descripcion) === clave);
  return item && opciones.some((o) => o.id === item.id_exp) ? item.id_exp : null;
}

/** PENDIENTE es el valor de captura: aún no hay etapa elegida. */
export function etapaAtencion(estatus: string | null | undefined): EtapaAtencion | null {
  const clave = normalizarTextoCatalogo(estatus);
  if (!clave || clave === 'PENDIENTE') return null;
  return ETAPAS[clave] ?? { etiqueta: estatus!.trim(), clase: 'tl-chip-neutral' };
}
