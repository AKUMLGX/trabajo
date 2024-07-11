import { Injectable, signal } from '@angular/core';
import { EuacapeApertura } from '../../interfaces/euacape-apertura';
import { GeneralidadesApertura } from '../../interfaces/generalidades-apertura';
import { RespuestaApertura } from '../../interfaces/respuesta-apertura';
import { CivilApertura } from '../../interfaces/civil-apertura';
import { PenalApertura } from '../../interfaces/penal-apertura';
import { ConcursoMercantilApertura } from '../../interfaces/concurso-mercantil-apertura';

@Injectable({
  providedIn: 'root'
})
export class FormsObjectService {

  constructor() { }

  euacapeFormObject = signal<EuacapeApertura>({
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

  generalidadesFormObject = signal<GeneralidadesApertura>({
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

  respuestaFormObject = signal<RespuestaApertura>({
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
    atencion:              '',
  });

  civilFormObject = signal<CivilApertura>({
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
    atencion:              '',
    tipo_asunto:           '',
  });

  penalFormObject = signal<PenalApertura>({
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
    atencion:              '',
    tipo_asunto:           '',
  });

  concursoMercantilFormObject = signal<ConcursoMercantilApertura>({
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
    atencion:              '',
    tipo_asunto:           '',
  });



}
