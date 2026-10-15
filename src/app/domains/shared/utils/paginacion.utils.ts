export function totalPaginas(total: number, tamano: number): number {
  return Math.max(1, Math.ceil(total / Math.max(1, tamano)));
}

/** Página válida dentro del rango; útil cuando el listado se reduce por filtros o recargas. */
export function paginaValida(pagina: number, total: number, tamano: number): number {
  return Math.min(Math.max(1, pagina), totalPaginas(total, tamano));
}

export function paginar<T>(items: T[], pagina: number, tamano: number): T[] {
  const inicio = (paginaValida(pagina, items.length, tamano) - 1) * tamano;
  return items.slice(inicio, inicio + tamano);
}
