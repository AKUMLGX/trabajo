import { Injectable, signal } from '@angular/core';
import { EuacapeApertura } from '../../interfaces/euacape-apertura';

@Injectable({
  providedIn: 'root'
})
export class FormsObjectService {

  constructor() { }

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

}
