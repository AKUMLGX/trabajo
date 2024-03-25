import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PenalApertura } from '../interfaces/penal-apertura';
import { PenalAperturaResponse } from '../interfaces/penal-apertura-response';

@Injectable({
  providedIn: 'root'
})
export class PenalAperturaService {

  constructor(
    private http: HttpClient,
  ) { }

  insertPenalForm(penalForm: PenalApertura) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.http.post<PenalAperturaResponse>(
      'http://localhost:8080/akamba/api/v1/asunto/nuevo/euacape/apertura/',
        penalForm, {headers: headers})
        .subscribe((res) => {
        console.log(res);
    });
  }

}
