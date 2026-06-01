export interface TemporalInsertRequest {
  id_expediente: number;
  oficio: string;
  expediente: string;
  numero_entrada_central: string;
  remitente_area: string;
  fecha_documento: string;
  fecha_recibido: string;
  referencia_asunto: string;
  fecha_vencimiento: string;
  dias_retraso: number;
  responsable: string;
  fecha_asignacion: string;
  sistema_aplicativo: string;
  woos: string;
  estatus: string;
  ubicacion: string;
  tipo_respuesta: string;
  tipo_documento: string;
  expediente_fisico_digital: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  usuario_creacion: string;
  usuario_actualizacion: string;
  tipo_medio_recepcion: string;
  tiene_fecha_atencion_inicial: boolean;
  fecha_atencion_inicial: string;
  fecha_estimada_atencion: string;
  fecha_atencion_realizada: string;
  fecha_vencimiento_35_dias: string;
  documento_pdf_nombre: string;
  prioridad: string;
  fecha_requerimiento: string;
}

export interface TemporalInsertResponse {
  uuid: string;
}

export interface TemporalRegistroRequest {
  uuid: string;
}

export interface TemporalRegistroResponse extends TemporalInsertRequest {}


export interface TemporalEliminaRequest {
  uuid: string;
}

export interface TemporalEliminaResponse {
  message?: string;
  success?: boolean;
}