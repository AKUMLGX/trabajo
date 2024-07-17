export interface GeneralidadesSecondPiece{
    folio_interno:         string;
    oficio:                string;
    folio_scanner:         string;
    carpeta_investigacion: string | null;
    documento_escaneado:   string;
    fecha_recepcion:       string;
    autoridad_remitente:   string;
    persona_relacionada:   string;
    turno_jefatura:        string | null;
    descripcion:           string;
    volante_jefatura:      string | null;
    folio_jupiter:         string | null;
    administracion:        string;
    plazo_atencion:        number | null;
    documento:             string;
    tipo_asunto:           string;
    atencion:              string,

}

//en insomnia sigue apareciendo autoridadad_solicitante

//campos que no se estan contemplando en el insomnia (yo si):
//carpeta_investigacion, volante_jefatura & folio_jupiter
