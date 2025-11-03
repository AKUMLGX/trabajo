// Interface para el expediente de Tlapohualli
export interface ExpedienteTlapohualli {
  id_expediente?: number;
  
  // Información básica del expediente
  expediente: string; // Ej: "Exp.001"
  oficio?: string; // Ej: "199 06 02 00 00 2025-01"
  numero_entrada_central?: string; // Puede estar vacío
  remitente_area?: string; // Ej: "AGSC"
  referencia_asunto?: string; // Descripción larga del asunto
  
  // Fechas y plazos
  fecha_documento?: Date; // Formato DD/MM/YYYY
  mes_documento?: number; // Número del mes (1-12)
  fecha_recibido?: Date;
  plazo_vencimiento_prioridad?: number; // Días de plazo
  fecha_vencimiento?: Date;
  dias_retraso?: number; // Calculado automáticamente
  fecha_notificacion?: Date;
  
  // Sistema y responsables
  sistema_aplicativo?: string; // Ej: "No aplica"
  responsable_fecha_asignacion?: string; // Ej: "N/A"
  woos?: string; // Ej: "REQS00002058748"
  numero_solicitudes_reales?: number;
  
  // Estado y seguimiento
  observaciones?: string; // Ej: "059 Víctor 2025"
  estatus?: string; // Ej: "ATENDIDO"
  ubicacion_carpeta?: string; // Ej: "Carpeta General - 1"
  respuesta_total_parcial?: string; // Ej: "Total", "Parcial", "Sin Respuesta"
  referencia_respuesta?: string; // Ej: "102 06 00 00 00 2025-059"
  
  // Documentos y respuestas
  oficios_comision_apoyo?: string; // Ej: "N/A"
  dictamen_reporte_acta?: string; // Puede estar vacío
  anexos?: string; // Lista de archivos separados por comas
  acuse_fisico_digital?: string; // Ej: "RRI-2501-001"
  expediente_fisico_digital?: boolean; // SI/NO convertido a boolean
  comentarios_omega?: string; // Comentarios largos
  
  // Campos de control
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  usuario_creacion?: string;
  usuario_actualizacion?: string;
}

// Interface para el formulario paso 1 - Información básica
export interface FormularioPaso1 {
  expediente: string; // Ej: "Exp.001" - OBLIGATORIO
  oficio?: string; // Ej: "199 06 02 00 00 2025-01"
  numero_entrada_central?: string; // Puede estar vacío
  remitente_area?: string; // Ej: "AGSC"
  referencia_asunto?: string; // Descripción del asunto
  fecha_documento?: Date; // Formato DD/MM/YYYY
  mes_documento?: number; // Número del mes (1-12)
  fecha_recibido?: Date; // Fecha de recepción
}

// Interface para el formulario paso 2 - Plazos y seguimiento
export interface FormularioPaso2 {
  plazo_vencimiento_prioridad?: number; // Días de plazo
  fecha_vencimiento?: Date; // Fecha calculada
  dias_retraso?: number; // Calculado automáticamente
  sistema_aplicativo?: string; // Ej: "No aplica"
  responsable_fecha_asignacion?: string; // Ej: "N/A"
  woos?: string; // Ej: "REQS00002058748"
  numero_solicitudes_reales?: number; // Número de solicitudes
  observaciones?: string; // Ej: "059 Víctor 2025"
  estatus?: string; // Ej: "ATENDIDO"
  ubicacion_carpeta?: string; // Ej: "Carpeta General - 1"
  respuesta_total_parcial?: string; // Ej: "Total", "Parcial", "Sin Respuesta"
  referencia_respuesta?: string; // Ej: "102 06 00 00 00 2025-059"
  fecha_notificacion?: Date; // Fecha de notificación
}

// Interface para el formulario paso 3 - Documentos y respuestas
export interface FormularioPaso3 {
  oficios_comision_apoyo?: string; // Ej: "N/A"
  dictamen_reporte_acta?: string; // Puede estar vacío
  anexos?: string; // Lista de archivos separados por comas
  acuse_fisico_digital?: string; // Ej: "RRI-2501-001"
  expediente_fisico_digital?: boolean; // SI/NO convertido a boolean
  comentarios_omega?: string; // Comentarios largos
}

// Catálogos para los dropdowns
export interface CatalogoSistemaAplicativo {
  id_sistema: number;
  nombre_sistema: string;
  descripcion?: string;
}

export interface CatalogoEstatusExpediente {
  id_estatus: number;
  nombre_estatus: string;
  descripcion?: string;
}

export interface CatalogoTipoRespuesta {
  id_tipo_respuesta: number;
  tipo_respuesta: string;
  descripcion?: string;
}

export interface CatalogoTipoDocumentoRespuesta {
  id_tipo_doc: number;
  tipo_documento: string;
  descripcion?: string;
}
