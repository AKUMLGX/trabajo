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

  constructor(private httpClient: HttpClient) { }

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
    let asunto: Asunto = {
      id_asunto_historico: 1, oficio: "00-01-04-00-00-2021-4236 DE 08/09/2021",
      autoridad_remitente: "prueba", folio: "prueba", folio_jupiter: "prueba", orden: 2,
      fecha_recepcion: new Date("23/05/2024"), documento_escaneado: "PDF", descripcion: "prueba",
      area_pendiente: "prueba", autoridad_solicitante: "Prueba",
      turno_jefatura: "prueba", correo_electronico: "Prueba", plazo_atencion: "Pruebas",
      jefatura: "pruebas", que_solicita: "string", fecha_numero_oficio_atencion: "2",
      asuntos_enviados_correo_mara: "dd", atentas_notas_respuestas: "dd", fecha_turnado: "TTT",
      hora_recepcion: new Date("23/05/2024"), unidad_administrativa_autoridad: "Prueba",
      fecha_descargo: new Date("23/05/2024"), fecha_oficio: new Date("23/05/2024"), respuesta: true,
      reporte: "Pruebas", acuse: "Prubas",
      piezas_fgr_administracion: "", base_captura_administracion: "", folio_interno: "Pruebas",
      carpeta_investigacion: "", persona_relacionada: "", folio_scanner: "", volante_jefatura: "",
      descargo: "", autor: "", documento: "", atencion: "", administracion: "",
      tipo_asunto: "", tipo: "", fecha_atencion: new Date("23/05/2024"), areas_pendientes: "PRUEBAS"
    };
    console.log("Exito BTN");

    this.documentList = [asunto];

    this.documentsUpdated.emit(this.documentList)

    // this.httpClient.get<Asunto[]>(url, { params: params }).subscribe((data) => {
    //   this.documentList = data;
    //   this.documentsUpdated.emit(this.documentList);
    // });
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

    switch (this.tipoBusqueda) {
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
