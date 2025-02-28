export interface RespuestaSecondPiece {
    folio_interno:         string;
    oficio:                string;
    folio_scanner:         number;
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
    adminstracion:         string,
    atencion:              string;
    tipo_asunto:           string;
}

//En el insomnia, administracion se repite dos veces

//Nuevamente, hay 3 campos que yo mando pero que no aparecen en insomnia,
//mismo caso que ocurrio en Generalidades Segunda Pieza, estos son:
//carpeta_investigacion, volante_jefatura & folio_jupiter
