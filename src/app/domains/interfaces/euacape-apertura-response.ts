export interface EuacapeAperturaResponse {
  descripcion: string;
  autor:       string;
  values:      EuacapeValue[];
}

export interface EuacapeValue {
  folio_interno:         any;
  carpeta_investigacion: any;
  folio_scanner:         any;
  oficio:                any;
  documento_escaneado:   any;
  persona_relacionada:   any;
  descripcion:           any;
  fecha_recepcion:      any
  autoridad_remitente:   any;
  turno_jefatura:        any;
  plazo_atencion:        any;
  administracion:        any;
  documento:             any;
}
