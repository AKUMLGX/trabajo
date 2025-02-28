export interface GeneralidadesAperturaResponse {
    descripcion: string;
    autor:       string;
    values:      GeneralidadesValue[];
}

export interface GeneralidadesValue {
    folio_scanner:         number;
    oficio:                string;
    turno_jefatura:        string;
    documento_escaneado:   string;
    fecha_recepcion:       Date;
    autoridad_remitente:   string;
    persona_relacionada:   string;
    carpeta_investigacion: string;
    descripcion:           string;
    administracion:        string;
    plazo_atencion:        number;
    tipo_asunto:           string;
    folio_jupiter:         string;
    volante_jefatura:      string;
    documento:             string;
    atencion:              string;
    folio_interno:         string;

}
