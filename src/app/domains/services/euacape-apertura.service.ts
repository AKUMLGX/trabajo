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

  // insertEuacapeForm(euacapeForm: EuacapeApertura) {
  //   const headers = new HttpHeaders({'Content-Type': 'application/json'});
  //   this.httpClient.post<EuacapeAperturaResponse>(
  //     environment.baseUrl + 'asunto/nuevo/euacape/apertura/',
  //       euacapeForm, {headers: headers})
  //       .subscribe((res) => {
  //       console.log(res);
  //   });
  // }

  insertEuacapeForm(euacapeForm: EuacapeApertura, selectedFile: File) {

    const euacapeFormJson = JSON.stringify(euacapeForm);
    const euacapeFormBlob = new Blob([euacapeFormJson], {
      type: 'application/json'
    });

    const formData = new FormData();

    formData.append('file', selectedFile, selectedFile.name);
    formData.append('euacapeForm', euacapeFormBlob);

    const headers = new HttpHeaders({'Content-Type': 'multipart/form-data'});

    this.httpClient.post(
      environment.baseUrl + 'asunto/nuevo/euacape/apertura/',
      formData, {headers: headers}
    ).subscribe((res) => {
        console.log(res);
    });
  }

}
  
