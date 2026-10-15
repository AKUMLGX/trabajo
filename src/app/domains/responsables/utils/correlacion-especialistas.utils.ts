import { Especialista } from '../services/seguimiento-asignacion.service';

/** Personas de correlación (semilla hasta que el catálogo en BD esté migrado). */
export const NOMBRES_SEMILLA_CORRELACION = [
  'Bruno',
  'Alan',
  'Leonardo',
  'Liliana',
  'Eduardo',
  'Alvaro',
  'Othoniel',
] as const;

const ID_CORRELACION_LOCAL_BASE = 910_000;

function normalizarNombre(nombre: string): string {
  return nombre.trim().toUpperCase();
}

export function idLocalCorrelacion(indice: number): number {
  return ID_CORRELACION_LOCAL_BASE + indice + 1;
}

export function esIdCorrelacionLocal(id: number): boolean {
  return id > ID_CORRELACION_LOCAL_BASE && id <= ID_CORRELACION_LOCAL_BASE + NOMBRES_SEMILLA_CORRELACION.length;
}

export function nombreCorrelacionDesdeIdLocal(id: number): string | null {
  if (!esIdCorrelacionLocal(id)) {
    return null;
  }
  const indice = id - ID_CORRELACION_LOCAL_BASE - 1;
  return NOMBRES_SEMILLA_CORRELACION[indice] ?? null;
}

/** Lista fija para la UI: prioriza registro del API; si no existe, id local temporal. */
export function listaCorrelacionParaUi(especialistas: Especialista[]): Especialista[] {
  const delApi = especialistas.filter((e) => e.grupo === 'CORRELACION');
  return NOMBRES_SEMILLA_CORRELACION.map((nombre, indice) => {
    const api = delApi.find((e) => normalizarNombre(e.nombre_completo) === normalizarNombre(nombre));
    if (api) {
      return api;
    }
    return {
      id_especialista: idLocalCorrelacion(indice),
      codigo: `CORR-${nombre.toUpperCase()}`,
      nombre_completo: nombre,
      grupo: 'CORRELACION',
      etiqueta: null,
      activo: true,
    };
  });
}

export function fusionarCatalogoConSemillaCorrelacion(especialistas: Especialista[]): Especialista[] {
  const sinCorrelacion = especialistas.filter((e) => e.grupo !== 'CORRELACION');
  return [...sinCorrelacion, ...listaCorrelacionParaUi(especialistas)];
}
