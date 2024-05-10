import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RespuestaApertura } from '../interfaces/respuesta-apertura';


@Injectable({
  providedIn: 'root'
})
export class RespuestaAperturaService {

  constructor(
    private http: HttpClient,
  ) { }

  insertRespuestaForm(respuestaForm: RespuestaApertura) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.http.post( 
      'http://localhost:8090/akamba/api/v1/asunto/nuevo/respuesta/apertura/',
        respuestaForm, {headers: headers})
        .subscribe((res) => {
        console.log(res);
    });
  }

}
