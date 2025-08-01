export interface porAsignarRequest{
  documento:string,
  estado_atencion:string,

}

export interface asutosPorDictaminador{
  documento:string,
  estado_atencion:string,

}

export interface tableAsuntosPorDictaminar{
  folio_interno: string,
  folio_scanner: number,
  carpeta_investigacion: string,
  oficio: string,
  persona_relacionada: string,
  fecha_recepcion: '',
  id_administracion_fk: number,
  id_documento_fk: number,
  id_atencion_fk: number,
  turno_jefatura: string,
  autoridad_remitente: string,
  id_asunto: number,
  es_historico: true,
  plazo_atencion:number,
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
  es_historico: true
}
