export interface EuacapeApertura {
    oficio:                string;
    folio_scanner:         number;
    carpeta_investigacion: string | null;
    documento_escaneado:   string;
    fecha_recepcion:       string;
    autoridad_remitente:   string;
    persona_relacionada:   string;
    turno_jefatura:        string | null;
    descripcion:           string;
    administracion:        string;
    plazo_atencion:        number | null;
    documento:             string;
    atencion:              string,
}

