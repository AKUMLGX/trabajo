export interface porAsignarRequest{
  documento:string,
  estado_atencion?:string, // Opcional, ya no se envía por defecto
}

export interface asutosPorDictaminador{
  documento:string,
  estado_atencion?:string, // Opcional, ya no se envía por defecto
}

export interface tableAsuntosPorDictaminar{
  folio_interno: string,
  folio_scanner: number,
  carpeta_investigacion: string,
  oficio: string,
  persona_relacionada: string,
  fecha_recepcion: string,
  id_administracion_fk: number,
  id_documento_fk: number,
  id_atencion_fk: number,
  turno_jefatura: string,
  autoridad_remitente: string,
  id_asunto: number,
  es_historico: boolean,
  plazo_atencion: number,
  // 🆕 Datos necesarios para la asignación en backend
  id_asignacion: number,
  tipo_asunto: string,
  rfc_dictaminador?: string,
  nombre_dictaminador?: string
}


export interface tableAsuntosPorAsignar{
  folio_interno: string,
  folio_scanner: number,
  carpeta_investigacion: string,
  oficio: string,
  persona_relacionada: string,
  fecha_recepcion: Date,
  id_administracion_fk: number,
  id_documento_fk: number,
  id_atencion_fk: number,
  turno_jefatura: string,
  autoridad_remitente: string,
  id_asunto: number,
  es_historico: boolean
}
