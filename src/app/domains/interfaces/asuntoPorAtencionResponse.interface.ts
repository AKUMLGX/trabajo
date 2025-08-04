export interface AsuntoPorAsigacionResponseEnTramite{
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
  es_historico: true,
  plazo_atencion:number
}

export interface AsuntoPorAsigacionResponseParcial{
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
  es_historico: true,
  plazo_atencion:number
}

export interface AsuntoPorAsigacionResponseTotal{
  id_asunto_historico:number,
  folio_interno: string,
  folio_scanner: number,
  carpeta_investigacion: string,
  oficio: string,
  documento_escaneado:string,
  persona_relacionada: string,
  descripcion:string,
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
  plazo_atencion:number
}

export interface AsuntoResponseTotal{
  asunto:{
    tipo:string,
    datos:AsuntoPorAsigacionResponseTotal,

       tipo_asunto: string,
        rfc_asignado:string,
        id_asignacion: null|number
  }
}


