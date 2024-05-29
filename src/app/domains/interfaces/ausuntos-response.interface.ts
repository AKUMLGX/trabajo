export interface AsuntoResponse {
  descripcion: string;
  autor:       string;
  values:      Value[];
}

export interface Value {
  folio_interno:         any;
  persona_relacionada:   any;
  administracion:        any;
  oficio:                any;
  documento_escaneado:   any;
  folio_scanner:         any;
  descripcion:           any;
  turno_jefatura:        any;
  plazo_atencion:        any;
  fecha_recepcion:      any
  autoridad_remitente:   any;
  carpeta_investigacion: any;
}
