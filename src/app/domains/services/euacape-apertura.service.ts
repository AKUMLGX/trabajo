import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EuacapeApertura } from '../interfaces/euacape-apertura';
import { EuacapeAperturaResponse } from '../interfaces/euacape-apertura-response';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EuacapeAperturaService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  insertEuacapeForm(euacapeForm: EuacapeApertura) {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    this.httpClient.post<EuacapeAperturaResponse>(
      environment.baseUrl + 'asunto/nuevo/euacape/apertura',
        euacapeForm, {headers: headers})
        .subscribe((res) => {
        console.log(res);
    });
  }

}
  
