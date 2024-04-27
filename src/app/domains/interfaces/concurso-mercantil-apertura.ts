export interface ConcursoMercantilApertura {
    folio_interno:            string;
    folio_scanner:            string;
    oficio:                   string;
    documento_escaneado:      string;
    persona_relacionada:      string;
    descripcion:              string;
    fecha_recepcion:          string;
    autoridad_remitente:      string;
    plazo_atencion:           number | null;
    administracion:           string;
    turno_jefatura:           string | null;
    carpeta_investigacion:    string | null;
    folio_jupiter:            string | null;
}
