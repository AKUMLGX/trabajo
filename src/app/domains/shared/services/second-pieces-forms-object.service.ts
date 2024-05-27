import { Injectable, signal } from '@angular/core';
import { EuacapeSecondPiece } from '../../interfaces/euacape-second-piece';
import { GeneralidadesSecondPiece } from '../../interfaces/generalidades-second-piece';
import { RespuestaSecondPiece } from '../../interfaces/respuesta-second-piece';

@Injectable({
  providedIn: 'root'
})
export class SecondPiecesFormsObjectService {

  constructor() { }

  euacapeFormObject = signal<EuacapeSecondPiece>({
    folio_interno:         '',
    oficio:                '',
    folio_scanner:         '',
    carpeta_investigacion: null,
    documento_escaneado:   '',
    fecha_recepcion:       '',
    autoridad_remitente:   '',
    persona_relacionada:   '',
    turno_jefatura:        null,
    descripcion:           '',
    administracion:        '',
    plazo_atencion:        null,
    documento:             '',
  });

  generalidadesFormObject = signal<GeneralidadesSecondPiece>({
    folio_interno:         '',
    oficio:                '',
    folio_scanner:         '',
    carpeta_investigacion: null,
    documento_escaneado:   '',
    fecha_recepcion:       '',
    autoridad_remitente:   '',
    persona_relacionada:   '',
    turno_jefatura:        null,
    descripcion:           '',
    volante_jefatura:      null,
    folio_jupiter:         null,
    administracion:        '',
    plazo_atencion:        null,
    documento:             '',
    tipo_asunto:           '',
  });

  respuestaFormObject = signal<RespuestaSecondPiece>({
    folio_interno:         '',     
    oficio:                '',     
    folio_scanner:         '',     
    carpeta_investigacion: null,   
    documento_escaneado:   '',     
    fecha_recepcion:       '',     
    autoridad_remitente:   '',     
    persona_relacionada:   '',     
    turno_jefatura:        null,   
    descripcion:           '',     
    volante_jefatura:      null,   
    folio_jupiter:         null,   
    administracion:        '',     
    plazo_atencion:        null,   
    documento:             '',
    adminstracion:         '',
    atencion:              '',
    tipo_asunto:           '',     
  });
  
}
