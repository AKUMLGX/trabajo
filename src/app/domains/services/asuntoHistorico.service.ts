import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AsuntoHistorico } from '../interfaces/asuntos.interfaces';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class AsuntoHistoricoService {
  public documentList: AsuntoHistorico[] = [];

  documentsUpdated: EventEmitter<AsuntoHistorico[]> = new EventEmitter();

  constructor(private httpClient: HttpClient) {}

  filterDocuments(consultForm: FormGroup): void {
    let folioInterno = consultForm.get('folioInterno')?.value;
    let carpetaInvertigacion = consultForm.get('carpetaInvertigacion')?.value;
    let oficio = consultForm.get('oficio')?.value;
    let autoridadRemitente = consultForm.get('autoridadRemitente')?.value;
    let personaRelacionada = consultForm.get('personaRelaciona')?.value;
    let params = {
      folio_interno: folioInterno,
      carpeta_investigacion: carpetaInvertigacion,
      oficio: oficio,
      autoridad_remitente: autoridadRemitente,
      personaRelaciona: personaRelacionada,
    };
    let url = environment.baseUrl + environment.asuntoHistoricoEndpoint;
    this.httpClient
      .get<AsuntoHistorico[]>(url, { params: params })
      .subscribe((data) => {
        this.documentList = data;
        this.documentsUpdated.emit(this.documentList);
      });
  }
}
