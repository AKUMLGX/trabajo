// import { HttpClient } from '@angular/common/http';
// import { EventEmitter, Injectable } from '@angular/core';
// import { environment } from '../../../environments/environment';
// import { Asunto } from '../interfaces/asuntos.interfaces';
// import { FormGroup } from '@angular/forms';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class AsuntoService {
//   public documentList: Asunto[] = [];

//   documentsUpdated: EventEmitter<Asunto[]> = new EventEmitter();

//   pdfIsOpenUpdated: EventEmitter<boolean> = new EventEmitter();

//   public pdfIsOpen: boolean = false;

//   public msgIsOpen: boolean = false;

//   public tipoBusqueda = '';

//   constructor(private httpClient: HttpClient) { }

//   filterDocuments(consultForm: FormGroup): void {
//     this.tipoBusqueda = consultForm.get('tipoBusqueda')?.value;
//     let folioInterno = consultForm.get('folioInterno')?.value;
//     let carpetaInvertigacion = consultForm.get('carpetaInvertigacion')?.value;
//     let oficio = consultForm.get('oficio')?.value;
//     let autoridadRemitente = consultForm.get('autoridadRemitente')?.value;
//     let personaRelacionada = consultForm.get('personaRelacionada')?.value;
//     let volante_jefatura = consultForm.get('volante_jefatura')?.value;
//     let url = environment.baseUrl + environment.asuntoEndpoint;
//     let params = {
//       folio_interno: folioInterno,
//       carpeta_investigacion: carpetaInvertigacion,
//       oficio: oficio,
//       autoridad_remitente: autoridadRemitente,
//       persona_relacionada: personaRelacionada,
//       volante_jefatura
//     };
//     let asunto: Asunto = {
//       id_asunto_historico: 1, oficio: "00-01-04-00-00-2021-4236 DE 08/09/2021",
//       autoridad_remitente: "prueba", folio: "prueba", folio_jupiter: "prueba", orden: 2,
//       fecha_recepcion: new Date("23/05/2024"), documento_escaneado: "PDF", descripcion: "prueba",
//       area_pendiente: "prueba", autoridad_solicitante: "Prueba",
//       turno_jefatura: "prueba", correo_electronico: "Prueba", plazo_atencion: "Pruebas",
//       jefatura: "pruebas", que_solicita: "string", fecha_numero_oficio_atencion: "2",
//       asuntos_enviados_correo_mara: "dd", atentas_notas_respuestas: "dd", fecha_turnado: "TTT",
//       hora_recepcion: new Date("23/05/2024"), unidad_administrativa_autoridad: "Prueba",
//       fecha_descargo: new Date("23/05/2024"), fecha_oficio: new Date("23/05/2024"), respuesta: true,
//       reporte: "Pruebas", acuse: "Prubas",
//       piezas_fgr_administracion: "ccc", base_captura_administracion: "dddd", folio_interno:"5555",
//       carpeta_investigacion: "ccc", persona_relacionada: "persona_relacionada", folio_scanner: "ddd", volante_jefatura: "qqqqq",
//       descargo: "dwwww", autor: "ee", documento: "documento", atencion: "ddd", administracion: "cccc",
//       tipo_asunto: "ddd", tipo: "ddd", fecha_atencion: new Date("23/05/2024"), areas_pendientes: "PRUEBAS",id_asunto_nuevo:5
//     };
//     let asunto1: Asunto = {
//       id_asunto_historico: null, oficio: "00-01-04-00-00-2021-4236 DE 08/09/2021",
//       autoridad_remitente: "prueba", folio: "prueba", folio_jupiter: "prueba", orden: 2,
//       fecha_recepcion: new Date("23/05/2024"), documento_escaneado: "msg", descripcion: "prueba",
//       area_pendiente: "prueba", autoridad_solicitante: "Prueba",
//       turno_jefatura: "prueba", correo_electronico: "Prueba", plazo_atencion: "Pruebas",
//       jefatura: "pruebas", que_solicita: "string", fecha_numero_oficio_atencion: "2",
//       asuntos_enviados_correo_mara: "dd", atentas_notas_respuestas: "dd", fecha_turnado: "TTT",
//       hora_recepcion: new Date("23/05/2024"), unidad_administrativa_autoridad: "Prueba",
//       fecha_descargo: new Date("23/05/2024"), fecha_oficio: new Date("23/05/2024"), respuesta: true,
//       reporte: "Pruebas", acuse: "Prubas",
//       piezas_fgr_administracion: "ccc", base_captura_administracion: "dddd", folio_interno:"5555",
//       carpeta_investigacion: "ccc", persona_relacionada: "persona_relacionada", folio_scanner: "ddd", volante_jefatura: "qqqqq",
//       descargo: "dwwww", autor: "ee", documento: "documento", atencion: "ddd", administracion: "cccc",
//       tipo_asunto: "ddd", tipo: "ddd", fecha_atencion: new Date("23/05/2024"), areas_pendientes: "PRUEBAS",id_asunto_nuevo:3
//     };
//     let asunto2: Asunto = {
//       id_asunto_historico: null, oficio: "00-01-04-00-00-2021-4236 DE 08/09/2020",
//       autoridad_remitente: "Fiscalia", folio: "25-SCRZ", folio_jupiter: "8633-Z", orden: 2,
//       fecha_recepcion: new Date("23/05/2024"), documento_escaneado: "PDF", descripcion: "Se hacen Pruebas Remitentes",
//       area_pendiente: "Verdader", autoridad_solicitante: "SAT",
//       turno_jefatura: "Alta", correo_electronico: "JuanJose@sat.gob.mx", plazo_atencion: "72HR",
//       jefatura: "Fiscalia", que_solicita: "SAT", fecha_numero_oficio_atencion: "9",
//       asuntos_enviados_correo_mara: "Asuntos de Pruebas", atentas_notas_respuestas: "Notas Prueba", fecha_turnado: "24/05/2024",
//       hora_recepcion: new Date("23/05/2024"), unidad_administrativa_autoridad: "Verdadera",
//       fecha_descargo: new Date("23/05/2024"), fecha_oficio: new Date("23/05/2024"), respuesta: true,
//       reporte: "Pruebas", acuse: "Prubas",
//       piezas_fgr_administracion: "FRG", base_captura_administracion: "Pruebas de Administración", folio_interno:"8711",
//       carpeta_investigacion: "ART-JOV", persona_relacionada: "Leopoldo Salazar Viniegra ", folio_scanner: "7937 ", volante_jefatura: "Volante de prueba",
//       descargo: "MEGA", autor: "María Dolores Estévez Zuleta", documento: "documento de Prueba", atencion: "72HRS", administracion: "Matutina",
//       tipo_asunto: "Urgente", tipo: "Verdadero", fecha_atencion: new Date("23/05/2024"), areas_pendientes: "Alta",id_asunto_nuevo:  null
//     };
//     let asunto3: Asunto = {
//       id_asunto_historico: null, oficio: "00-01-04-00-00-2021-4236 DE 08/09/2020",
//       autoridad_remitente: "Fiscalia", folio: "25-SCRZ", folio_jupiter: "8633-Z", orden: 2,
//       fecha_recepcion: new Date("23/05/2024"), documento_escaneado: "PDF", descripcion: "Se hacen Pruebas Remitentes",
//       area_pendiente: "Verdader", autoridad_solicitante: "SAT",
//       turno_jefatura: "Alta", correo_electronico: "JuanJose@sat.gob.mx", plazo_atencion: "72HR",
//       jefatura: "Fiscalia", que_solicita: "SAT", fecha_numero_oficio_atencion: "9",
//       asuntos_enviados_correo_mara: "Asuntos de Pruebas", atentas_notas_respuestas: "Notas Prueba", fecha_turnado: "24/05/2024",
//       hora_recepcion: new Date("23/05/2024"), unidad_administrativa_autoridad: "Verdadera",
//       fecha_descargo: new Date("23/05/2024"), fecha_oficio: new Date("23/05/2024"), respuesta: true,
//       reporte: "Pruebas", acuse: "Prubas",
//       piezas_fgr_administracion: "FRG", base_captura_administracion: "Pruebas de Administración", folio_interno:"1569",
//       carpeta_investigacion: "ART-JOV", persona_relacionada: "Leopoldo Salazar Viniegra ", folio_scanner: "7937 ", volante_jefatura: "Volante de prueba",
//       descargo: "MEGA", autor: "María Dolores Estévez Zuleta", documento: "documento de Prueba", atencion: "72HRS", administracion: "Matutina",
//       tipo_asunto: "Urgente", tipo: "Verdadero", fecha_atencion: new Date("23/05/2024"), areas_pendientes: "Alta",id_asunto_nuevo:333
//     };
//     console.log("Exito BTN");

//     this.documentList = [asunto,asunto1,asunto2,asunto3];

//     this.documentsUpdated.emit(this.documentList)

//     // this.httpClient.get<Asunto[]>(url, { params: params }).subscribe((data) => {
//     //   this.documentList = data;
//     //   this.documentsUpdated.emit(this.documentList);
//     // });
//   }

//   searchBarCoincidences(
//     searchEntryType: string,
//     userInputForm: FormGroup
//   ): Observable<Asunto[]> {

//     this.tipoBusqueda = searchEntryType;

//     let userInput = userInputForm.get('userInput')?.value;

//     let carpetaInvestigacion: string = '';
//     let personaRelacionada: string = '';
//     let folioInterno: string = '';
//     let oficio: string = '';
//     let autoridadRemitente: string = '';
//     let volante_jefatura: string = '';

//     switch (this.tipoBusqueda) {
//       case "CARPETA DE INVESTIGACIÓN": {
//         carpetaInvestigacion = userInput;
//         break;
//       }
//       case "PERSONA RELACIONADA": {
//         personaRelacionada = userInput;
//         break;
//       }
//       case "FOLIO INTERNO": {
//         folioInterno = userInput;
//         break;
//       }
//       case "OFICIO": {
//         oficio = userInput;
//         break;
//       }
//     }

//     let url = environment.baseUrl + environment.asuntoEndpoint;
//     let params = {
//       folio_interno: folioInterno,
//       carpeta_investigacion: carpetaInvestigacion,
//       oficio: oficio,
//       autoridad_remitente: autoridadRemitente,
//       persona_relacionada: personaRelacionada,
//       volante_jefatura
//     };

//     return this.httpClient.get<Asunto[]>(
//       url, { params: params });
//   }


//   openPdf(): void {
//     this.pdfIsOpen = true;
//     this.pdfIsOpenUpdated.emit(true);
//   }

//   closePdf(): void {
//     this.pdfIsOpen = false;
//     this.pdfIsOpenUpdated.emit(false);
//   }

//   openMsg(): void {
//     this.msgIsOpen = true;
//     this.pdfIsOpenUpdated.emit(true);
//   }

//   closeMsg(): void {
//     this.msgIsOpen = false;
//     this.pdfIsOpenUpdated.emit(false);
//   }
// }


import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Asunto } from '../interfaces/asuntos.interfaces';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AsuntoService {
  public documentList: Asunto[] = [];

  documentsUpdated: EventEmitter<Asunto[]> = new EventEmitter();

  pdfIsOpenUpdated: EventEmitter<boolean> = new EventEmitter();

  public pdfIsOpen: boolean = false;

  public msgIsOpen: boolean = false;

  public tipoBusqueda = '';

  constructor(private httpClient: HttpClient) {}

  filterDocuments(consultForm: FormGroup): void {
    this.tipoBusqueda = consultForm.get('tipoBusqueda')?.value;
    let folioInterno = consultForm.get('folioInterno')?.value;
    let carpetaInvertigacion = consultForm.get('carpetaInvertigacion')?.value;
    let oficio = consultForm.get('oficio')?.value;
    let autoridadRemitente = consultForm.get('autoridadRemitente')?.value;
    let personaRelacionada = consultForm.get('personaRelacionada')?.value;
    let volante_jefatura = consultForm.get('volante_jefatura')?.value;
    let url = environment.baseUrl + environment.asuntoEndpoint;
    let params = {
      folio_interno: folioInterno,
      carpeta_investigacion: carpetaInvertigacion,
      oficio: oficio,
      autoridad_remitente: autoridadRemitente,
      persona_relacionada: personaRelacionada,
      volante_jefatura
    };
    this.httpClient.get<Asunto[]>(url, { params: params }).subscribe((data) => {
      this.documentList = data;
      this.documentsUpdated.emit(this.documentList);
    });
  }


  searchBarCoincidences(
      searchEntryType: string,
      userInputForm: FormGroup
    ): Observable<Asunto[]> {

    this.tipoBusqueda = searchEntryType;

    let userInput = userInputForm.get('userInput')?.value;

    let carpetaInvestigacion: string = '';
    let personaRelacionada: string = '';
    let folioInterno: string = '';
    let oficio: string = '';
    let autoridadRemitente: string = '';
    let volante_jefatura: string = '';

    switch(this.tipoBusqueda) {
      case "CARPETA DE INVESTIGACIÓN": {
        carpetaInvestigacion = userInput;
        break;
      }
      case "PERSONA RELACIONADA": {
        personaRelacionada = userInput;
        break;
      }
      case "FOLIO INTERNO": {
        folioInterno = userInput;
        break;
      }
      case "OFICIO": {
        oficio = userInput;
        break;
      }
    }

    let url = environment.baseUrl + environment.asuntoEndpoint;
    let params = {
      folio_interno: folioInterno,
      carpeta_investigacion: carpetaInvestigacion,
      oficio: oficio,
      autoridad_remitente: autoridadRemitente,
      persona_relacionada: personaRelacionada,
      volante_jefatura
    };

    return this.httpClient.get<Asunto[]>(
        url, { params: params });
  }


  openPdf(): void {
    this.pdfIsOpen = true;
    this.pdfIsOpenUpdated.emit(true);
  }

  closePdf(): void {
    this.pdfIsOpen = false;
    this.pdfIsOpenUpdated.emit(false);
  }

  openMsg(): void {
    this.msgIsOpen = true;
    this.pdfIsOpenUpdated.emit(true);
  }

  closeMsg(): void {
    this.msgIsOpen = false;
    this.pdfIsOpenUpdated.emit(false);
  }
}
