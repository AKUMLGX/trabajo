import { CatalogoReworkItem } from '../../capture/interfaces/expediente-rework.interface';

export type FamiliaEntregable = 'DICTAMEN' | 'REPORTE';

export interface SubtipoEntregable {
  codigo: string;
  nombre: string;
  familia: FamiliaEntregable;
  /** id en catalogo_dictamen / catalogo_reporte (getCat/7 y getCat/8); lo pide el consecutivo. */
  idCatalogo?: number;
}

export interface FolioEntregableLocal {
  idLocal: string;
  codigo: string;
  nombre: string;
  familia: FamiliaEntregable;
  folio: string;
  anio: number;
  mes: number;
  consecutivo: number;
  estado: 'ACTIVO' | 'CANCELADO';
  motivo_cancelacion?: string | null;
  creado_en: string;
  /** true si el folio quedó registrado en consecutivos_dictamen / consecutivos_reporte; los anteriores solo viven en `anexos`. */
  registrado_en_servidor?: boolean;
}

export interface AnexosEntregablesPayload {
  version: 1;
  folios: FolioEntregableLocal[];
  /** Texto libre de anexos (no sobrescribe folios). */
  nota?: string;
  /** Correlación seleccionada por nombre cuando el catálogo aún no tiene ids en BD. */
  correlacion_nombres?: string[];
}

export const SUBTIPOS_DICTAMEN: SubtipoEntregable[] = [
  { codigo: 'DAF', nombre: 'Dictamen de análisis forense', familia: 'DICTAMEN' },
  { codigo: 'DPA', nombre: 'Dictamen de pistas de auditoría', familia: 'DICTAMEN' },
  { codigo: 'DJN', nombre: 'Dictamen de juicios de nulidad', familia: 'DICTAMEN' },
];

export const SUBTIPOS_REPORTE: SubtipoEntregable[] = [
  { codigo: 'RPE', nombre: 'Reporte especial', familia: 'REPORTE' },
  { codigo: 'RCF', nombre: 'Reporte de cómputo forense', familia: 'REPORTE' },
  { codigo: 'RPI', nombre: 'Reporte de investigación', familia: 'REPORTE' },
  { codigo: 'RRI', nombre: 'Reporte de recuperación', familia: 'REPORTE' },
  { codigo: 'RPM', nombre: 'Reporte de monitoreo', familia: 'REPORTE' },
  { codigo: 'REF', nombre: 'Reporte estadístico de fuente', familia: 'REPORTE' },
  { codigo: 'OT', nombre: 'Opinión técnica', familia: 'REPORTE' },
];

export const TODOS_SUBTIPOS_ENTREGABLE = [...SUBTIPOS_DICTAMEN, ...SUBTIPOS_REPORTE];

/** Siglas del catálogo del back con su nombre; las siglas que no conocemos se muestran tal cual. */
export function subtiposDesdeCatalogo(items: CatalogoReworkItem[], familia: FamiliaEntregable): SubtipoEntregable[] {
  return items
    .filter((i) => !i.eliminado && i.descripcion?.trim())
    .map((i) => {
      const codigo = i.descripcion.trim().toUpperCase();
      return {
        codigo,
        nombre: buscarSubtipo(codigo)?.nombre ?? codigo,
        familia,
        idCatalogo: i.id_exp,
      };
    });
}

/** El back entrega `COD-YYMM-N` (consecutivo anual por subtipo, sin ceros a la izquierda). */
export function folioEntregableDesdeApi(subtipo: SubtipoEntregable, folio: string, fecha = new Date()): FolioEntregableLocal {
  const [, yymm = '', n = ''] = folio.split('-');
  const anio = yymm.length === 4 ? 2000 + Number(yymm.slice(0, 2)) : fecha.getFullYear();
  const mes = yymm.length === 4 ? Number(yymm.slice(2, 4)) : fecha.getMonth() + 1;
  return {
    idLocal: nuevoIdLocalFolio(),
    codigo: subtipo.codigo,
    nombre: subtipo.nombre,
    familia: subtipo.familia,
    folio,
    anio,
    mes,
    consecutivo: Number.parseInt(n, 10) || 0,
    estado: 'ACTIVO',
    motivo_cancelacion: null,
    creado_en: fecha.toISOString(),
    registrado_en_servidor: true,
  };
}

export function buscarSubtipo(codigo: string): SubtipoEntregable | undefined {
  return TODOS_SUBTIPOS_ENTREGABLE.find((s) => s.codigo === codigo);
}

export function parseAnexosEntregables(anexos: string | null | undefined): {
  folios: FolioEntregableLocal[];
  nota: string;
  correlacion_nombres: string[];
} {
  if (!anexos?.trim()) {
    return { folios: [], nota: '', correlacion_nombres: [] };
  }
  try {
    const data = JSON.parse(anexos) as AnexosEntregablesPayload;
    if (data?.version === 1 && Array.isArray(data.folios)) {
      const nombres = Array.isArray(data.correlacion_nombres)
        ? data.correlacion_nombres.map((n) => String(n).trim()).filter(Boolean)
        : [];
      return { folios: data.folios, nota: (data.nota ?? '').trim(), correlacion_nombres: nombres };
    }
  } catch {
    /* texto libre legacy */
  }
  return { folios: [], nota: anexos.trim(), correlacion_nombres: [] };
}

export function serializarAnexosEntregables(
  folios: FolioEntregableLocal[],
  nota = '',
  correlacionNombres: string[] = []
): string {
  const notaTrim = nota.trim();
  const correlacion = correlacionNombres.map((n) => n.trim()).filter(Boolean);
  if (!folios.length && !notaTrim && !correlacion.length) {
    return '';
  }
  const payload: AnexosEntregablesPayload = {
    version: 1,
    folios,
    nota: notaTrim || undefined,
    correlacion_nombres: correlacion.length ? correlacion : undefined,
  };
  return JSON.stringify(payload);
}

/** Folios del esquema anterior que ya aparecen en `anexos` no se repiten en la lista de solo consulta. */
export function foliosAnterioresSinDuplicar<T extends { folio: string }>(anteriores: T[], actuales: FolioEntregableLocal[]): T[] {
  const enAnexos = new Set(actuales.map((f) => f.folio.toUpperCase()));
  return anteriores.filter((f) => !enAnexos.has(f.folio.toUpperCase()));
}

export function nuevoIdLocalFolio(): string {
  return `fe_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
