export interface ExpedienteReworkInicialPayload {
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
  aplicativos: string;
  responsable: string;
  status: number;
  observaciones: string;
  ubicacion: number;
}

export interface ExpedienteReworkInicialResponse {
  id_expediente: number;
  mensaje: string;
}

export interface CargaPdfReworkResponse {
  id: number;
  mensaje: string;
}

export interface ArchivoPdfRework {
  id_archivo: number;
  id_expediente: number;
  path_archivo: string;
  nombre_archivo: string;
}

export interface CatalogoReworkItem {
  id_exp: number;
  descripcion: string;
  fecha_creacion?: string;
  eliminado?: boolean;
}
