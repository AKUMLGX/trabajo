import { EspecialistaSesion } from '../../interfaces/oauth2.interfaces';
import { AsignacionesSeguimiento, Especialista } from '../services/seguimiento-asignacion.service';

export function normalizarNombreEspecialista(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

/** Una entrada por persona: junta los ids que tiene en cada grupo (analista, QA, correlación). */
export function agruparEspecialistasPorPersona(especialistas: Especialista[]): EspecialistaSesion[] {
  const porNombre = new Map<string, EspecialistaSesion>();
  for (const e of especialistas) {
    if (!e.activo) continue;
    const clave = normalizarNombreEspecialista(e.nombre_completo);
    const persona = porNombre.get(clave) ?? { nombre: e.nombre_completo.trim(), ids: [] };
    persona.ids.push(e.id_especialista);
    porNombre.set(clave, persona);
  }
  return [...porNombre.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/** true si el especialista aparece en cualquier grupo de la asignación. */
export function estaAsignado(asignaciones: AsignacionesSeguimiento | null | undefined, especialista: EspecialistaSesion): boolean {
  if (!asignaciones) return false;
  const asignados = new Set([
    ...(asignaciones.analistas ?? []),
    ...(asignaciones.qa_tecnico ?? []),
    ...(asignaciones.qa_legal ?? []),
    ...(asignaciones.qa_interno ?? []),
    ...(asignaciones.correlacion ?? []),
  ]);
  return especialista.ids.some((id) => asignados.has(id));
}
