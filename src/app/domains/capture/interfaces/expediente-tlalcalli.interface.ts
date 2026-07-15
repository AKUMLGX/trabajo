// Interface para el expediente de Tlalcalli (coincide con el backend)
export interface ExpedienteTlalcalli {
  id_expediente?: number;
  
  // Información básica del expediente
  tipo_medio_recepcion?: string | null; // 'ATENTA_NOTA' | 'OFICIO' | 'REQUERIMIENTO_VERBAL' | 'CORREO_ELECTRONICO'
  expediente: string; // Ej: "Exp.001-2025"
  oficio?: string; // Ej: "199 06 02 00 00 2025-01"
  numero_entrada_central?: string; // Puede estar vacío
  remitente_area?: string; // Ej: "AGSC"
  referencia_asunto?: string; // Descripción larga del asunto
  
  // Fechas y plazos (vienen como strings del backend: "YYYY-MM-DD")
  fecha_documento?: string | Date; // Formato "YYYY-MM-DD" del backend
  fecha_recibido?: string | Date; // Formato "YYYY-MM-DD" del backend
  fecha_requerimiento?: string | Date | null; // Fecha del requerimiento (nuevo campo)
  plazo_valor?: number; // Valor del plazo
  plazo_unidad?: string; // 'dias', 'horas', 'ambos'
  plazo_es_urgente?: boolean;
  fecha_vencimiento?: string | Date | null; // Formato "YYYY-MM-DD" del backend
  dias_retraso?: number | null; // Calculado automáticamente
  fecha_notificacion?: string | Date | null;
  
  // Campos de atención (regla de 35 días)
  tiene_fecha_atencion_inicial?: boolean | null;
  fecha_atencion_inicial?: string | Date | null;
  fecha_estimada_atencion?: string | Date | null;
  fecha_atencion_realizada?: string | Date | null;
  fecha_vencimiento_35_dias?: string | Date | null;
  
  // Sistema y responsables
  sistema_aplicativo?: string | null; // Ej: "No aplica"
  responsable?: string; // Campo del backend (no responsable_fecha_asignacion)
  fecha_asignacion?: string | Date; // Campo del backend
  woos?: string; // Ej: "REQS00002058748"
  
  // Estado y seguimiento
  estatus?: string; // Ej: "PENDIENTE", "EN_TRAMITE", etc.
  ubicacion?: string; // Ej: "CARPETA_GENERAL"
  oficios_comision?: string | null;
  tipo_respuesta?: string;
  
  // Prioridad del expediente (asignada en captura)
  prioridad?: string | null; // 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAJA'
  
  // Documentos y respuestas
  tipo_documento?: string;
  documento_pdf_nombre?: string | null; // Nombre del PDF principal del expediente
  anexos?: string | null; // Lista de archivos separados por comas
  acuse_fisico_digital?: string | null; // Ej: "RRI-2501-001"
  expediente_fisico_digital?: string; // "SI" o "NO" del backend
  comentarios_omega?: string | null; // Comentarios largos
  
  // Campos de control
  fecha_creacion?: string | Date | null;
  fecha_actualizacion?: string | Date | null;
  usuario_creacion?: string | null;
  usuario_actualizacion?: string | null;
}

// Interface para el formulario paso 1 - Información básica
export interface FormularioPaso1 {
  tipo_medio_recepcion: string; // ATENTA_NOTA | OFICIO | REQUERIMIENTO_VERBAL | CORREO_ELECTRONICO
  expediente: string; // Ej: "Exp.001" - OBLIGATORIO
  oficio?: string; // Ej: "199 06 02 00 00 2025-01"
  numero_entrada_central?: string; // Puede estar vacío
  remitente_area?: string; // Ej: "AGSC"
  referencia_asunto?: string; // Descripción del asunto
  fecha_documento?: Date; // Formato DD/MM/YYYY
  mes_documento?: number; // Número del mes (1-12)
  fecha_recibido?: Date; // Fecha de recepción
  fecha_vencimiento?: Date; // Fecha de vencimiento del requerimiento
  prioridad?: string; // 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAJA'
}

// Interface para el formulario paso 2 - Plazos y seguimiento
export interface FormularioPaso2 {
  plazo_vencimiento_prioridad?: number; // Días de plazo
  fecha_vencimiento?: Date; // Fecha calculada
  dias_retraso?: number; // Calculado automáticamente
  sistema_aplicativo?: string; // Ej: "No aplica"
  responsable?: string;
  responsable_fecha_asignacion?: string; // Ej: "N/A" (flujos legacy)
  woos?: string; // Ej: "REQS00002058748"
  numero_solicitudes_reales?: number; // Número de solicitudes
  observaciones?: string; // Ej: "059 Víctor 2025"
  estatus?: string; // Ej: "ATENDIDO"
  ubicacion_carpeta?: string; // Ej: "Carpeta General - 1"
  respuesta_total_parcial?: string; // Ej: "Total", "Parcial", "Sin Respuesta"
  referencia_respuesta?: string; // Ej: "102 06 00 00 00 2025-059"
  fecha_notificacion?: Date; // Fecha de notificación
  
  // Prioridad del expediente (se asigna en captura)
  prioridad?: string; // 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAJA'
}

// Interface para el formulario paso 3 - Documentos y respuestas
export interface FormularioPaso3 {
  documento_pdf?: File; // Documento principal en PDF
  documento_pdf_nombre?: string; // Nombre del archivo para mostrar/resumir
  // Campos retirados temporalmente que podrán reintroducirse más adelante:
  campos_pospuestos?: string[];
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
