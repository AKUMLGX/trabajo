export interface UsuarioTemporalPayload {
  tipo_usuario: string;
  nombre: string;
  rfc: string;
}

/** Payload alineado con JsonPayloadTempExpediente del backend */
export interface TemporalInsertRequest {
  id_expediente: number;
  modo_expediente: string;
  expediente: string;
  mes_expediente: string;
  tipo_medio_recepcion: string;
  oficio: string;
  servicio: number;
  numero_entrada_central: string;
  remitente_general: string;
  remitente_central: string;
  remitente_identificador: string;
  remitente_area: string;
  fecha_documento: string;
  fecha_recibido: string;
  fecha_requerimiento: string;
  prioridad: number;
  plazo_vencimiento_dias_habiles: number;
  fecha_vencimiento: string;
  referencia_asunto: string;
  usuarios: UsuarioTemporalPayload[];
  responsable: string;
  sistema_aplicativo: string;
  documento_pdf_nombre: string;
  expediente_fisico_digital: string;
}

export interface TemporalInsertResponse {
  uuid: string;
}

export interface TemporalRegistroRequest {
  uuid: string;
}

/** Respuesta alineada con RespuestaJsonBusquedaUUID del backend */
export interface TemporalRegistroResponse {
  id_expediente: number | null;
  modo_expediente: string | null;
  expediente: string;
  mes_expediente: string;
  tipo_medio_recepcion: string;
  oficio: string;
  servicio: number;
  numero_central: string;
  remitente_general: string;
  remitente_central: string;
  remitente_identificador: string;
  remitente_area: string;
  fecha_documento: string;
  fecha_recibido: string;
  fecha_requerimiento: string;
  prioridad: number;
  dias_vencimiento: number;
  fecha_vencimiento: string;
  referencia_asunto: string;
  usuarios: UsuarioTemporalPayload[];
  responsable: string;
  sistema_aplicativo: string;
  documento_pdf_nombre: string | null;
  expediente_fisico_digital: string | null;
}

export interface TemporalEliminaRequest {
  uuid: string;
}

export interface TemporalEliminaResponse {
  message?: string;
  success?: boolean;
}
