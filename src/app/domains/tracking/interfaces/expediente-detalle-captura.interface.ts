import { UsuarioRequerimiento } from '../../interfaces/usuarios-expediente.interface';

export interface ExpedienteDetalleCaptura {
  id_expediente?: number;
  origen: 'legacy' | 'rework';

  expediente: string;
  oficio: string;
  servicio: string;
  numero_entrada_central: string;
  remitente: string;
  fecha_documento: string;
  fecha_recepcion: string;
  /** Días hábiles de plazo; rework no lo persiste — se calcula desde fechas si falta en API */
  plazo_vencimiento: string;
  fecha_vencimiento: string;
  prioridad: string;
  asunto: string;
  usuarios: UsuarioRequerimiento[];

  aplicativos: string;
  responsable: string;
  estatus: string;
  ubicacion: string;
  observaciones: string;

  documento_pdf_nombre: string | null;
  tiene_pdf: boolean;
  id_archivo_pdf?: number | null;
  archivos_pdf?: ArchivoPdfDetalleItem[];

  /** IDs de catálogo rework (solo origen rework) para formulario de edición */
  servicio_id?: number | null;
  prioridad_id?: number | null;
  status_id?: number | null;
  ubicacion_id?: number | null;
}

/** Valores del formulario de edición de expediente (captura paso 1+2) */
export interface ExpedienteEdicionFormValores {
  expediente: string;
  oficio: string;
  servicio: number | null;
  numero_entrada_central: string;
  remitente: string;
  fecha_documento: string;
  fecha_recepcion: string;
  prioridad: number | null;
  fecha_vencimiento: string;
  asunto: string;
  usuarios: UsuarioRequerimiento[];
  aplicativos: string;
  responsable: string;
  status: number | null;
  observaciones: string;
  ubicacion: number | null;
}

export interface ArchivoPdfDetalleItem {
  id_archivo: number;
  nombre_archivo: string;
  id_expediente?: number;
  num_expediente?: string;
}

export type TabDocumentosDetalle = 'inicial' | 'adjuntos';

/** Item GET/PUT expedientes_rework/{id}/oficios (back: ResponseOficiosPorIdExpediente) */
export interface ResponseOficiosPorIdExpediente {
  id: number;
  num_expediente: string;
  fecha_documento: string;
  fecha_recepcion: string;
  fecha_vencimiento: string;
  asunto: string;
  num_oficio: string;
  num_entrada: string;
  id_archivo: number;
  path_archivo: string;
}

export interface OficioAdjuntoExpediente {
  id?: number;
  /** id_archivo en archivos_pdf (rework) — visor PDF y PUT multipart */
  id_archivo?: number;
  /** Identificador local para listas y edición en sesión */
  localId?: string;
  /** Número de oficio del documento */
  num_oficio: string;
  /** Fecha del documento */
  fecha_documento?: string;
  /** Fecha de recepción del documento */
  fecha_recepcion?: string;
  /** Plazo / fecha de vencimiento */
  fecha_vencimiento?: string;
  /** Asunto o referencia del oficio */
  asunto?: string;
  nombre_archivo: string;
  fecha_registro?: string;
  /** true cuando el registro vive solo en memoria (sin POST en back) */
  pendiente_endpoint?: boolean;
}

export interface OficioAdjuntoGuardadoEvent {
  oficio: OficioAdjuntoExpediente;
  archivo: File | null;
  /** Presente al editar un oficio existente */
  localId?: string;
}

export interface ExpedienteReworkConsultaRow {
  id: number;
  num_expediente: string;
  num_oficio: string;
  servicio: string;
  num_entrada: string;
  remitente: string;
  fecha_documento: string;
  fecha_recepcion: string;
  prioridad: string;
  fecha_vencimiento: string;
  asunto: string;
  usuarios: string;
  aplicativos: string | null;
  responsable: string;
  status: string;
  observaciones: string | null;
  ubicacion: string;
}

export interface ExpedienteReworkCompletoResponse {
  expediente: {
    id: number;
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
    aplicativos: string | null;
    responsable: string;
    status: number;
    observaciones: string | null;
    ubicacion: number;
  };
  seguimiento: unknown | null;
  cierre: unknown | null;
}
