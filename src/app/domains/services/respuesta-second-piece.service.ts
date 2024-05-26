import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RespuestaSecondPiece } from '../interfaces/respuesta-second-piece';

@Injectable({
  providedIn: 'root'
})
export class RespuestaSecondPieceService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  insertSecondPieceRespuestaForm(
    respuestaForm: RespuestaSecondPiece, 
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
