import { Injectable, signal } from '@angular/core';
import { EuacapeApertura } from '../../interfaces/euacape-apertura';
import { CivilApertura } from '../../interfaces/civil-apertura';
import { PenalApertura } from '../../interfaces/penal-apertura';
import { ConcursoMercantilApertura } from '../../interfaces/concurso-mercantil-apertura';
import { GeneralidadesApertura } from '../../interfaces/generalidades-apertura';

@Injectable({
  providedIn: 'root'
})
export class FormsObjectService {

  constructor() { }

  civilFormObject = signal<CivilApertura>({
    folio_interno:              '',
    folio_scanner:              '',
    oficio:                     '',
    documento_escaneado:        '',
    persona_relacionada:        '',
    descripcion:                '',
    fecha_recepcion:            '',
    autoridad_remitente:        '',
    plazo_atencion:             null,
    administracion:             '',
    turno_jefatura:             null,
    carpeta_investigacion:      null,
    autoridad_administrativa:   null,
    folio_jupiter:              null,
  });

  penalFormObject = signal<PenalApertura>({
    folio_interno:              '',
    folio_scanner:              '',
    oficio:                     '',
    documento_escaneado:        '',
    persona_relacionada:        '',
    descripcion:                '',
    fecha_recepcion:            '',
    autoridad_remitente:        '',
    plazo_atencion:             null,
    administracion:             '',
    turno_jefatura:             null,
    carpeta_investigacion:      null,
    autoridad_administrativa:   null,
    folio_jupiter:              null,
  });

  concursoMercantilFormObject = signal<ConcursoMercantilApertura>({
    folio_interno:              '',
    folio_scanner:              '',
    oficio:                     '',
    documento_escaneado:        '',
    persona_relacionada:        '',
    descripcion:                '',
    fecha_recepcion:            '',
    autoridad_remitente:        '',
    plazo_atencion:             null,
    administracion:             '',
    turno_jefatura:             null,
    carpeta_investigacion:      null,
    folio_jupiter:              null,
  });

  euacapeFormObject = signal<EuacapeApertura>({
    folio_interno:              '',
    folio_scanner:              '',
    oficio:                     '',
    documento_escaneado:        '',
    persona_relacionada:        '',
    descripcion:                '',
    fecha_recepcion:            '',
    autoridad_remitente:        '',
    plazo_atencion:             null,
    administracion:             '',
    turno_jefatura:             null,
    carpeta_investigacion:      null,
  });

  generalidadesFormObject = signal<GeneralidadesApertura>({
    folio_interno:              '',
    folio_scanner:              '',
    oficio:                     '',
    documento_escaneado:        '',
    persona_relacionada:        '',
    descripcion:                '',
    fecha_recepcion:            '',
    autoridad_remitente:        '',
    plazo_atencion:             null,
    administracion:             '',
    turno_jefatura:             null,
    carpeta_investigacion:      null,
    autoridad_administrativa:   null,
    folio_jupiter:              null,
  });

}
