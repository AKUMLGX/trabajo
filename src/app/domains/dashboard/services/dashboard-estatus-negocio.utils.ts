import { normalizarTextoCatalogo } from '../../shared/utils/catalogo-estatus.utils';

/** Agrupación de estatus del catálogo de captura para gráficas y reportes de negocio (5 categorías). */
export type BucketEstatus = 'PENDIENTE' | 'ATENDIDA' | 'EN_PROCESO' | 'EN_FIRMA' | 'CANCELADO';

/** Orden de leyenda y columnas: pendiente → atendido → proceso → firma → cancelado. */
export const BUCKETS_ESTATUS: BucketEstatus[] = [
  'PENDIENTE',
  'ATENDIDA',
  'EN_PROCESO',
  'EN_FIRMA',
  'CANCELADO',
];

export const ETIQUETAS_BUCKET_ESTATUS: Record<BucketEstatus, string> = {
  PENDIENTE: 'Pendiente',
  ATENDIDA: 'Atendido',
  EN_PROCESO: 'En proceso',
  EN_FIRMA: 'En espera de firma',
  CANCELADO: 'Cancelado',
};

export const COLORES_BUCKET_ESTATUS: Record<BucketEstatus, string> = {
  PENDIENTE: '#FFA400',
  ATENDIDA: '#00B37A',
  EN_PROCESO: '#5D337C',
  EN_FIRMA: '#D6AE67',
  CANCELADO: '#7F7D7B',
};

export { normalizarTextoCatalogo };

const EN_PROCESO_PREFIJOS = [
  'EN PROCESO',
  'EN ELABORACION',
  'QA ',
  'SOLICITUD DE INFORMACION',
  'GESTION DE VIATICOS',
];

/**
 * Mapea un estatus del catálogo de captura a una de las 5 categorías de negocio.
 * No existe bucket "Otros": vacíos → Pendiente; desconocidos → En proceso.
 */
export function bucketEstatus(estatus: string | null | undefined): BucketEstatus {
  const s = normalizarTextoCatalogo(estatus);
  if (!s) {
    return 'PENDIENTE';
  }
  if (s === 'ATENDIDO' || s === 'CONOCIMIENTO') {
    return 'ATENDIDA';
  }
  if (s === 'CANCELADO') {
    return 'CANCELADO';
  }
  if (s.includes('FIRMA')) {
    return 'EN_FIRMA';
  }
  if (s.startsWith('PENDIENTE') || s.startsWith('PEDIENTE')) {
    return 'PENDIENTE';
  }
  if (EN_PROCESO_PREFIJOS.some((p) => s.startsWith(p))) {
    return 'EN_PROCESO';
  }
  return 'EN_PROCESO';
}
