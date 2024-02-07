import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AsuntoHistorico } from '../interfaces/asuntos.interfaces';

@Injectable({
  providedIn: 'root'
})
export class Oauth2Service {

  constructor(private httpClient: HttpClient) { }

  filterDocuments(): void {
    console.log("Buscando documentos");
    this.httpClient.get<AsuntoHistorico[]>(environment.baseUrl + environment.tokenValidationEndpoint)
      .subscribe(data => {
        console.log("Se obtiene lo siguiente " + data);
      });   
  }


}

