import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RespuestaApertura } from '../interfaces/respuesta-apertura';
import { environment } from '../../../environments/environment';
import { RespuestaAperturaResponse } from '../interfaces/respuesta-apertura-response';


@Injectable({
  providedIn: 'root'
})
export class RespuestaAperturaService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  // insertRespuestaForm(respuestaForm: RespuestaApertura) {
  //   const headers = new HttpHeaders({'Content-Type': 'application/json'});
  //   this.http.post<RespuestaAperturaResponse>( 
  //     environment.baseUrl + 'asunto/nuevo/respuesta/apertura/',
  //       respuestaForm, {headers: headers})
  //       .subscribe((res) => {
  //       console.log(res);
  //   });
  // }

  insertRespuestaForm(
    respuestaForm: RespuestaApertura, 
    selectedFile: File
  ) {

    const respuestaFormJson = JSON.stringify(respuestaForm);
    const respuestaFormBlob = new Blob([respuestaFormJson], {
      type: 'application/json'
    });

    const formData = new FormData();

    formData.append('file', selectedFile, selectedFile.name);
    formData.append('respuestaForm', respuestaFormBlob);

    const headers = new HttpHeaders({'Content-Type': 'multipart/form-data'});

    this.httpClient.post(
      environment.baseUrl + 'asunto/nuevo/respuesta/apertura/',
      formData, {headers: headers}
    ).subscribe((res) => {
        console.log(res);
    });
  }

}
