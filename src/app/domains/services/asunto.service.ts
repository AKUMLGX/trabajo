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
    let volante = consultForm.get('volante')?.value;
    let url = environment.baseUrl;
    switch (this.tipoBusqueda) {
      case 'Nuevos': {
        url += environment.asuntoNuevoEndpoint;
        break;
      }
      case 'Historicos': {
        url += environment.asuntoHistoricoEndpoint;
        break;
      }
      case 'Todos': {
        url += environment.asuntoEndpoint;
      }
    }
    let params = {
      folio_interno: folioInterno,
      carpeta_investigacion: carpetaInvertigacion,
      oficio: oficio,
      autoridad_remitente: autoridadRemitente,
      persona_relacionada: personaRelacionada,
    };
    this.httpClient.get<Asunto[]>(url, { params: params }).subscribe((data) => {
      this.documentList = data;
      this.documentsUpdated.emit(this.documentList);
    });
  }
}
