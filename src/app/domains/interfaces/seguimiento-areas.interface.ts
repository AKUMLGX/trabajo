// Interfaces para el Control de Seguimiento de Áreas

// Área disponible del catálogo
export interface AreaDisponible {
  area: string;              // Código del área (ACOP, AGR, etc.)
  descripcion_area: string;  // Descripción completa
}

// Solicitud de información (para crear)
export interface NewChecklistRequerimiento {
  id_asignacion_fk: number;  // ID de la asignación del asunto
  area: string;              // Código del área
  id_estado_respuesta?: number; // Estado de la respuesta (opcional)
  fecha_solicitud: string;   // Fecha de solicitud
  fecha_respuesta?: string;  // Fecha de respuesta (opcional)
  fecha_recordatorio_envio?: string; // Fecha de envío de recordatorio (opcional)
  fecha_recordatorio_respuesta?: string; // Fecha respuesta a recordatorio (opcional)
  observaciones?: string;    // Observaciones (opcional)
}

// Checklist de requerimiento (respuesta del backend)
export interface ChecklistRequerimiento {
  id_check: number;          // ID único del checklist
  id_asignacion_fk: number;  // ID de la asignación del asunto
  area: string;              // Código del área
  id_estado_respuesta?: number; // Estado de la respuesta
  fecha_solicitud: string;   // Fecha de solicitud
  fecha_respuesta?: string;  // Fecha de respuesta
  fecha_recordatorio_envio?: string; // Fecha de envío de recordatorio
  fecha_recordatorio_respuesta?: string; // Fecha respuesta a recordatorio
  observaciones?: string;    // Observaciones
}

// Área de seguimiento (formato para el frontend)
export interface AreaSeguimiento {
  id: number;                // ID del checklist
  area: string;              // Código del área
  nombreCompleto: string;    // Nombre completo del área
  solicitudEnviada: boolean; // Si la solicitud fue enviada
  fechaSolicitud?: string;   // Fecha de solicitud (formateada)
  respuestaRecibida: boolean; // Si la respuesta fue recibida
  fechaRespuesta?: string;   // Fecha de respuesta (formateada)
  tipoRespuesta: string;     // Tipo de respuesta (pendiente, parcial, completa)
  recordatorioEnviado: boolean; // Si se envió recordatorio
  fechaRecordatorio?: string; // Fecha de recordatorio (formateada)
  respuestaRecordatorio: boolean; // Si se recibió respuesta al recordatorio
  fechaRespuestaRecordatorio?: string; // Fecha respuesta a recordatorio (formateada)
  observaciones?: string;    // Observaciones
}
