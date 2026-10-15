/** Mayúsculas, sin acentos y con espacios simples: así se comparan las descripciones de catálogo. */
export function normalizarTextoCatalogo(valor: string | null | undefined): string {
  return (valor || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

/** Siguen en el catálogo del back (expedientes viejos los usan), pero ya no se ofrecen para elegir. */
const ESTATUS_RETIRADOS = new Set(['GESTION DE VIATICOS']);

/** Nombre visible cuando difiere del que guarda el catálogo. */
const ETIQUETAS_ESTATUS: Record<string, string> = {
  'EN ESPERA DE FIRMA DEL CENTRAL': 'EN ESPERA DE FIRMA',
};

export function etiquetaEstatus(descripcion: string | null | undefined): string {
  return ETIQUETAS_ESTATUS[normalizarTextoCatalogo(descripcion)] ?? (descripcion ?? '').trim();
}

export function esEstatusRetirado(descripcion: string | null | undefined): boolean {
  return ESTATUS_RETIRADOS.has(normalizarTextoCatalogo(descripcion));
}

/** Quita los retirados, salvo el que ya tiene el expediente para no dejar el campo vacío al editar. */
export function estatusSeleccionables<T extends { id_exp: number; descripcion: string }>(
  items: T[],
  idActual?: number | null
): T[] {
  return items.filter((i) => i.id_exp === idActual || !esEstatusRetirado(i.descripcion));
}
