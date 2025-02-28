import { Injectable, signal } from '@angular/core';
import { EuacapeSecondPiece } from '../../interfaces/euacape-second-piece';
import { GeneralidadesSecondPiece } from '../../interfaces/generalidades-second-piece';
import { RespuestaSecondPiece } from '../../interfaces/respuesta-second-piece';
import { CivilSecondPiece } from '../../interfaces/civil-second-piece';
import { PenalSecondPiece } from '../../interfaces/penal-second-piece';
import { ConcursoMercantilSecondPiece } from '../../interfaces/concurso-mercantil-second-piece';

@Injectable({
  providedIn: 'root'
})
export class SecondPiecesFormsObjectService {

  constructor() { }

  euacapeFormObject = signal<EuacapeSecondPiece>({
    folio_interno:         '',
    oficio:                '',
    folio_scanner:         0,
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
    atencion:              '',
  });

  generalidadesFormObject = signal<GeneralidadesSecondPiece>({
    folio_interno:         '',
    oficio:                '',
    folio_scanner:         0,
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
    atencion:              '',

  });

  respuestaFormObject = signal<RespuestaSecondPiece>({
    folio_interno:         '',
    oficio:                '',
    folio_scanner:         0,
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

  civilFormObject = signal<CivilSecondPiece>({
    oficio:                '',
    folio_scanner:         0,
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
    atencion:              '',
    tipo_asunto:           '',
  });

  penalFormObject = signal<PenalSecondPiece>({
    oficio:                '',
    folio_scanner:         0,
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
    atencion:              '',
    tipo_asunto:           '',
  });

  concursoMercantilFormObject = signal<ConcursoMercantilSecondPiece>({
    oficio:                '',
    folio_scanner:         0,
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
    atencion:              '',
    tipo_asunto:           '',
  });

}
