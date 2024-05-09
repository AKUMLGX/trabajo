import { Injectable, signal } from '@angular/core';
import { EuacapeApertura } from '../../interfaces/euacape-apertura';
import { GeneralidadesApertura } from '../../interfaces/generalidades-apertura';

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

}
