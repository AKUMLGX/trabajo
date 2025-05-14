export interface AsuntoResponse {
  descripcion: string;
  autor:       string;
  values:      Value[];
}

export interface Value {
  folio_interno:         String;
  persona_relacionada:   String;
  administracion:        String;
  oficio:                String;
  documento_escaneado:   String;
  folio_scanner:         number;
  descripcion:           String;
  turno_jefatura:        String;
  plazo_atencion:        number;
  fecha_recepcion:      Date;
  autoridad_remitente:   String;
  carpeta_investigacion: String;
}
