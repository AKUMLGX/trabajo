export interface AsuntoResponse {
  descripcion: string;
  autor:       string;
  values:      Value[];
}

export interface Value {
  folio_interno:         string;
  persona_relacionada:   string;
  administracion:        string;
  oficio:                string;
  documento_escaneado:   string;
  folio_scanner:         number;
  descripcion:           string;
  turno_jefatura:        string;
  plazo_atencion:        number;
  fecha_recepcion:      Date;
  autoridad_remitente:   string;
  carpeta_investigacion: string;
}
