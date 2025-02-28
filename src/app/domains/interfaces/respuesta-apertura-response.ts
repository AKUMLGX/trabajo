export interface RespuestaAperturaResponse {
    descripcion: string;
    autor:       string;
    values:      RespuestaValue[];
}

export interface RespuestaValue{
    folio_interno:         string;
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
    documento:             string;
    atencion:              string;
    tipo_asunto:           string;
    folio_jupiter:         string;
    volante_jefatura:      string;
}
