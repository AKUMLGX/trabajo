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

  fileIsOpenUpdated: EventEmitter<boolean> = new EventEmitter();

  public fileIsOpen: boolean = false;

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
    this.fileIsOpen = true;
    this.fileIsOpenUpdated.emit(true);
  }

  closePdf(): void {
    this.fileIsOpen = false;
    this.fileIsOpenUpdated.emit(false);
  }

  openMsg(): void {
    this.fileIsOpen = true;
    this.fileIsOpenUpdated.emit(true);
  }

  closeMsg(): void {
    this.fileIsOpen = false;
    this.fileIsOpenUpdated.emit(false);
  }
}
