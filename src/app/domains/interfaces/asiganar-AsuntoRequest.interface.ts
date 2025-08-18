
export interface AsignarAsunto {
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
  plazo_atencion:number
}


export interface AsignarAsuntoRequest {
  id_asignacion: number,
  tipo_asunto: string,
  id_asunto: number,
  rfc: string,
  fecha_asignacion: null | string,
  estado_atencion: number,
}


export interface tableAsuntosPorAsignar{
  id_asunto_historico: number,
  folio_interno: string,
  folio_scanner: number,
  carpeta_investigacion: string,
  oficio: string,
  documento_escaneado: string,
  persona_relacionada: string,
  descripcion: string,
  fecha_recepcion: string,
  id_administracion_fk: number,
  id_documento_fk: number,
  id_atencion_fk: number,
  id_tipo_fk: number,
  id_tipo_asunto_fk: number,
  turno_jefatura: string,
  autoridad_remitente: string,
  id_asunto: number,
  es_historico: true,
  plazo_atencion: number
}

export interface AsuntoResponseAsignar{
  asunto: {
    tipo:string,
    datos:tableAsuntosPorAsignar,
    tipo_asunto: string,
    rfc_asignado: string,
    id_asignacion: null | number
  }
}


 export interface modalItem{
  folio_interno: string,
  persona_relacionada: string,
  carpeta_investigacion: string,
  plazo_atencion:number,
  id_asignacion: number
 }
