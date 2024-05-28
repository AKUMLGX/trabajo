import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Asunto } from '../interfaces/asuntos.interfaces';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EditTackingTableService {

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  constructor(private http: HttpClient) { }

  updateTrackingTable(data:Asunto):Observable<Asunto>{
    //debugger
    let  targetUrl  = environment.baseUrl
    if (data.id_asunto_historico !== null) {
      targetUrl =  environment.baseUrl +    environment.updateTableHistorico
      console.log(targetUrl);
    }else if(data.id_asunto_nuevo !==null){
      targetUrl= environment.baseUrl +  environment.updateTableNuevo
      console.log(targetUrl);
    }
    console.log(targetUrl);

     return this.http.patch<Asunto>(targetUrl,
      data, this.httpOptions)
  }


   }


