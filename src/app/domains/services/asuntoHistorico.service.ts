import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsuntoHistoricoService {

  private _documents: String[] = ["Hola"];

  documentsUpdated: EventEmitter<String[]> = new EventEmitter();

  constructor(private httpClient: HttpClient) { }


  filterDocuments(): void {
    console.log("Buscando documentos");
    this.httpClient.get(environment.baseUrl + 'asunto_historico/?folio_interno=Folio%20EUACAPE%20&carpeta_investigacion=Carpeta%20Investigacion%20')
      /*.subscribe(resp => {
        console.log(resp);
      });
    this.documentsUpdated.emit(this._documents);*/
  }


}

