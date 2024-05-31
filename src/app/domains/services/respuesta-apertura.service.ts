import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RespuestaApertura } from '../interfaces/respuesta-apertura';
import { environment } from '../../../environments/environment';
import { RespuestaAperturaResponse } from '../interfaces/respuesta-apertura-response';
import { PdfAcuseService } from '../shared/services/pdf-acuse.service';
import { AsuntoResponse } from '../interfaces/ausuntos-response.interface';

@Injectable({
  providedIn: 'root'
})
export class RespuestaAperturaService {

  constructor(
    private httpClient: HttpClient,
    private pdfAcuseService: PdfAcuseService,
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
    data: RespuestaApertura,
    selectedFile: File
  ) {

    const json = JSON.stringify(data);
    const blob = new Blob([json], {
      type: 'application/json'
    });

    const formData = new FormData();

    formData.append("data", blob);
    formData.append("file", selectedFile, selectedFile.name);

    this.httpClient.post<AsuntoResponse> (
      environment.baseUrl + 'asunto/nuevo/respuesta/apertura/',
      formData,
    ).subscribe((data) => {
      this.pdfAcuseService.generatePDF(data)
    },
  (error)=>{

  });
  }

}
