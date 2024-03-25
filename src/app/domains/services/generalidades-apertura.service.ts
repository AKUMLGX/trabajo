import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneralidadesApertura } from '../interfaces/generalidades-apertura';
import { GeneralidadesAperturaResponse } from '../interfaces/generalidades-apertura-response';

@Injectable({
  providedIn: 'root'
})
export class GeneralidadesAperturaService {

  constructor(
    private http: HttpClient,
  ) { }

  insertGeneralidadesForm(generalidadesForm: GeneralidadesApertura) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.http.post<GeneralidadesAperturaResponse>(
      'http://localhost:8080/akamba/api/v1/asunto/nuevo/euacape/apertura/',
        generalidadesForm, {headers: headers})
        .subscribe((res) => {
        console.log(res);
    });
  }

}
