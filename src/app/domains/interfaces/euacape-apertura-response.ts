export interface EuacapeAperturaResponse {
    descripcion: string;
    autor:       string;
    values:      EuacapeValue[];
}

export interface EuacapeValue {
    folio_interno:         string;
    carpeta_investigacion: string;
    folio_scanner:         string;
    oficio:                string;
    documento_escaneado:   string;
    persona_relacionada:   string;
    descripcion:           string;
    fecha_recepcion:       Date;
    autoridad_remitente:   string;
    turno_jefatura:        string;
    plazo_atencion:        number;
    administracion:        string;
    documento:             string;
}
