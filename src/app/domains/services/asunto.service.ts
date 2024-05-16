import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Asunto } from '../interfaces/asuntos.interfaces';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class AsuntoService {
  public documentList: Asunto[] = [];

  documentsUpdated: EventEmitter<Asunto[]> = new EventEmitter();

  pdfIsOpenUpdated: EventEmitter<boolean> = new EventEmitter();

  public pdfIsOpen: boolean = false;
  
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


  openPdf(): void {
    this.pdfIsOpen = true;
    this.pdfIsOpenUpdated.emit(true);
  }

  closePdf(): void {
    this.pdfIsOpen = false;
    this.pdfIsOpenUpdated.emit(false);
  }
}
