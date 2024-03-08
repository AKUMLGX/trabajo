import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EuacapeApertura } from '../interfaces/euacape-apertura';
import { EuacapeAperturaResponse } from '../interfaces/euacape-apertura-response';

@Injectable({
  providedIn: 'root'
})
export class EuacapeAperturaService {

  constructor(
    private http: HttpClient,
  ) { }

  insertEuacapeForm(euacapeForm: EuacapeApertura) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.http.post<EuacapeAperturaResponse>(
      'http://localhost:8090/akamba/api/v1/asunto/nuevo/euacape/apertura/',
        euacapeForm, {headers: headers})
        .subscribe((res) => {
        console.log(res);
    });
  }

}
