import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AsuntoHistorico } from '../interfaces/asuntos.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AsuntoHistoricoService {

  public documentList: AsuntoHistorico[] = [];

  documentsUpdated: EventEmitter<AsuntoHistorico[]> = new EventEmitter();

  constructor(private httpClient: HttpClient) { }


  filterDocuments(): void {
    console.log("Buscando documentos");
    this.httpClient.get<AsuntoHistorico[]>(environment.baseUrl + 'asunto_historico/?folio_interno=Folio%20EUACAPE%20&carpeta_investigacion=Carpeta%20Investigacion%20')
      .subscribe(data => {
        this.documentList = data;
        this.documentsUpdated.emit(this.documentList);
      });
      
  }


}

