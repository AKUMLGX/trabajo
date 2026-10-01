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

/** PUT expedientes_rework/inicial_oficio — oficio/fechas/asunto del expediente principal */
export interface ExpedienteReworkInicialOficioPayload {
  num_expediente: string;
  num_oficio: string;
  fecha_documento: string;
  fecha_recepcion: string;
  fecha_vencimiento: string;
  asunto: string;
}

export interface ExpedienteReworkInicialResponse {
  id_expediente: number;
  mensaje: string;
}

export interface CargaPdfReworkResponse {
  id: number;
  mensaje: string;
}

/** Respuesta cruda de GET expedientes_rework/archivos_pdf/obten_listado */
export interface ArchivoPdfListadoItem {
  id_archivo: number;
  path: string;
  id_expediente: number;
  num_expediente: string;
}

/** PDF del expediente tras filtrar el listado global por id_expediente */
export interface ArchivoPdfRework {
  id_archivo: number;
  id_expediente: number;
  path_archivo: string;
  nombre_archivo: string;
  num_expediente?: string;
}

export interface CatalogoReworkItem {
  id_exp: number;
  descripcion: string;
  fecha_creacion?: string;
  eliminado?: boolean;
}
