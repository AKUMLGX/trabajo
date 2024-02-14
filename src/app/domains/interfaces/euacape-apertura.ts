export interface EuacapeApertura {
    folio_interno:         string;
    folio_scanner:         string;
    oficio:                string;
    documento_escaneado:   string;
    persona_relacionada:   string;
    descripcion:           string;
    fecha_recepcion:       string;
    autoridad_solicitante: string;
    plazo_atencion:        string;
    administracion:        string;
    //turno_jefatura:        string | null;
    //carpeta_investigacion: string | null;
}
