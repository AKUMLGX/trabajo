import { UsuarioRequerimiento } from '../../interfaces/usuarios-expediente.interface';

export interface ExpedienteDetalleCaptura {
  id_expediente?: number;
  origen: 'legacy' | 'rework';

  expediente: string;
  oficio: string;
  tipo_medio_recepcion: string;
  servicio: string;
  numero_entrada_central: string;
  remitente: string;
  fecha_documento: string;
  fecha_recepcion: string;
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
  archivos_pdf?: { id_archivo: number; nombre_archivo: string }[];
}

export type TabDocumentosDetalle = 'inicial' | 'adjuntos';

export interface OficioAdjuntoExpediente {
  id?: number;
  tipo: string;
  num_oficio: string;
  fecha_documento: string;
  descripcion?: string;
  nombre_archivo: string;
  fecha_registro?: string;
}

export interface ExpedienteReworkConsultaRow {
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
