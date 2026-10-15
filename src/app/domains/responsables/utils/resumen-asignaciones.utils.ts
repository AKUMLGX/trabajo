import { ResumenSeguimiento } from '../services/seguimiento-asignacion.service';

export interface LineaAsignacionResumen {
  etiqueta: string;
  texto: string;
}

/** Texto en bandeja a partir de `GET seguimiento_asignacion/resumen` (rol 001 trae todos los grupos; 003 solo su fila). */
export function lineasAsignacionEnResumen(
  resumen: ResumenSeguimiento,
  vistaEspecialista: boolean
): LineaAsignacionResumen[] {
  if (vistaEspecialista) {
    const nombre = resumen.analistas_asignados?.trim();
    return nombre ? [{ etiqueta: 'Tu asignación', texto: nombre }] : [];
  }

  const filas: LineaAsignacionResumen[] = [];
  const agregar = (etiqueta: string, valor?: string | null) => {
    const texto = valor?.trim();
    if (texto) {
      filas.push({ etiqueta, texto });
    }
  };

  agregar('Analistas', resumen.analistas_asignados);
  agregar('QA legal', resumen.qa_legal_asignados);
  agregar('QA técnico', resumen.qa_tecnico_asignados);
  agregar('QA interno', resumen.qa_interno_asignados);
  agregar('Correlación', resumen.correlacion_asignados);
  return filas;
}
