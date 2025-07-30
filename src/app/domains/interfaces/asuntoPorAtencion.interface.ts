export interface AsuntoPorAtencionEnTramiteRequest{
  documento:string,
  atencion:string
}
export interface AsuntoPorAtencionParcialRequest{
  documento:string,
  atencion:string
}
export interface AsuntoPorAtencionTotalRequest{
  documento:string,
  atencion:string
}

// 🆕 Nueva interface para el endpoint get_asunto_por_estado_atencion
export interface AsuntoPorEstadoAtencionRequest {
  documento: string;        // "REQUERIMIENTO", obligatorio
  estado_atencion: string; // "POR ASIGNAR", según catálogo de estados
}

// 🆕 Interfaces para la respuesta del endpoint
export interface AsuntoNuevo {
  id_asunto_nuevo: number;
  folio_interno: string;
  carpeta_investigacion: string;
  folio_scanner: number;
  oficio: string;
  documento_escaneado: string | null;
  persona_relacionada: string;
  descripcion: string | null;
  fecha_recepcion: string;
  fecha_atencion: string | null;
  turno_jefatura: string;
  respuesta: string | null;
  volante_jefatura: string | null;
  folio_jupiter: string | null;
  autoridad_remitente: string;
  plazo_atencion: number;
  fecha_captura: string | null;
  id_documento_fk: number;
  id_atencion_fk: number;
  id_administracion_fk: number;
  id_tipo_asunto_fk: number | null;
  id_tipo_fk: number | null;
}

export interface AsuntoHistorico {
  id_asunto_historico: number;
  folio_interno: string;
  carpeta_investigacion: string;
  folio_scanner: number;
  oficio: string;
  persona_relacionada: string;
  fecha_recepcion: string;
  autoridad_remitente: string;
  plazo_atencion: number;
  id_administracion_fk: number;
  id_documento_fk: number;
  id_atencion_fk: number;
  // ... otros campos según la documentación
}

export interface AsuntoAsignacion {
  asunto: {
    tipo: "Nuevo" | "Historico";
    datos: AsuntoNuevo | AsuntoHistorico;
  } | {
    Nuevo?: AsuntoNuevo;
    Historico?: AsuntoHistorico;
  };
  tipo_asunto: "NUEVO" | "HISTORICO";
  rfc_asignado: string;
  id_asignacion: number | null;
}

export type AsuntoPorEstadoAtencionResponse = AsuntoAsignacion[];
