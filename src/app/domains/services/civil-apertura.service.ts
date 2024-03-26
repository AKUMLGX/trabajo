import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CivilApertura } from '../interfaces/civil-apertura';
import { CivilAperturaResponse } from '../interfaces/civil-apertura-response';

@Injectable({
  providedIn: 'root'
})
export class CivilAperturaService {

  constructor(
    private http: HttpClient,
  ) { }

  insertCivilForm(civilForm: CivilApertura) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.http.post<CivilAperturaResponse>(
      'http://localhost:8080/akamba/api/v1/asunto/nuevo/euacape/apertura/',
        civilForm, {headers: headers})
        .subscribe((res) => {
        console.log(res);
    });
  }

}
