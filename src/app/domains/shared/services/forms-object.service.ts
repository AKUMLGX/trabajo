import { Injectable, signal } from '@angular/core';
import { EuacapeApertura } from '../../interfaces/euacape-apertura';

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

}
