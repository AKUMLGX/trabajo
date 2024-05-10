import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneralidadesApertura } from '../interfaces/generalidades-apertura';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneralidadesAperturaService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  insertGeneralidadesForm(generalidadesForm: GeneralidadesApertura) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.httpClient.post( 
      environment.baseUrl + 'asunto/nuevo/generalidad/apertura/',
        generalidadesForm, {headers: headers})
        .subscribe((res) => {
        console.log(res);
    });
  }

}
