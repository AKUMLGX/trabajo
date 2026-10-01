/** Payload alineado con expediente rework (Max: POST temporal/insert) */
export interface TemporalInsertRequest {
  num_expediente: string;
  num_oficio: string;
  servicio: number;
  num_entrada: string;
  remitente: string;
  fecha_documento: string;
  fecha_recepcion: string;
  prioridad: number;
  fecha_vencimiento: string;
  asunto: string;
  usuarios: string;
  aplicativos?: string | null;
  responsable: string;
  status: number;
  observaciones?: string | null;
  ubicacion: number;
}

export interface TemporalInsertResponse {
  uuid: string;
}

export interface TemporalRegistroRequest {
  uuid: string;
}

/** Misma forma que insert + uuid; fechas del backend como YYYY-MM-DD */
export interface TemporalRegistroResponse extends TemporalInsertRequest {
  uuid: string;
}

export interface TemporalUpdateRequest extends TemporalInsertRequest {
  uuid: string;
}

export interface TemporalEliminaRequest {
  uuid: string;
}

export interface TemporalEliminaResponse {
  mensaje?: string;
}
