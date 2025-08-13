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
   asunto:modalItem;
   rfc_asignado: string;
}


 export interface modalItem{
  folio_interno: string,
  persona_relacionada: string,
  carpeta_investigacion: string,
  plazo_atencion:number,
 }
