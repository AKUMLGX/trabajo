import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneralidadesApertura } from '../interfaces/generalidades-apertura';

@Injectable({
  providedIn: 'root'
})
export class GeneralidadesAperturaService {

  constructor(
    private http: HttpClient,
  ) { }

  insertGeneralidadesForm(generalidadesForm: GeneralidadesApertura) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.http.post( 
      'http://localhost:8090/akamba/api/v1/asunto/nuevo/generalidad/apertura/',
        generalidadesForm, {headers: headers})
        .subscribe((res) => {
        console.log(res);
    });
  }

}
