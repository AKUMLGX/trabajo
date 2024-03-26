import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConcursoMercantilApertura } from '../interfaces/concurso-mercantil-apertura';
import { ConcursoMercantilAperturaResponse } from '../interfaces/concurso-mercantil-apertura-response';

@Injectable({
  providedIn: 'root'
})
export class ConcursoMercantilAperturaService {

  constructor(
    private http: HttpClient,
  ) { }

  insertConcursoMercantilForm(concursoMercantilForm: ConcursoMercantilApertura) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.http.post<ConcursoMercantilAperturaResponse>(
      'http://localhost:8080/akamba/api/v1/asunto/nuevo/euacape/apertura/',
        concursoMercantilForm, {headers: headers})
        .subscribe((res) => {
        console.log(res);
    });
  }

}
