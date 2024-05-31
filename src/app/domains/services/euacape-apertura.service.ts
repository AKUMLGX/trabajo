import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EuacapeApertura } from '../interfaces/euacape-apertura';
import { EuacapeAperturaResponse } from '../interfaces/euacape-apertura-response';
import { environment } from '../../../environments/environment';
import { PdfAcuseService } from '../shared/services/pdf-acuse.service';
import { AsuntoResponse } from '../interfaces/ausuntos-response.interface';

@Injectable({
  providedIn: 'root'
})
export class EuacapeAperturaService {

  constructor(
    private httpClient: HttpClient,
    private pdfAcuseService: PdfAcuseService,
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

  insertEuacapeForm(data: EuacapeApertura, selectedFile: File) {

    const json = JSON.stringify(data);
    const blob = new Blob([json], {
      type: 'application/json'
    });

    const formData = new FormData();

    formData.append("data", blob);
    formData.append("file", selectedFile, selectedFile.name);

    //const headers = new HttpHeaders({'Content-Type': 'multipart/form-data'});

    this.httpClient.post<AsuntoResponse>(
      environment.baseUrl + 'asunto/nuevo/euacape/apertura/',
      formData,
    ).subscribe((data) => {
      this.pdfAcuseService.generatePDF(data);
    },
  (error)=>{

  });
  }
}
