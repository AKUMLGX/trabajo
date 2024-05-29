import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneralidadesApertura } from '../interfaces/generalidades-apertura';
import { environment } from '../../../environments/environment';
import { GeneralidadesAperturaResponse } from '../interfaces/generalidades-apertura-response';
import { AsuntoResponse } from '../interfaces/ausuntos-response.interface';
import { PdfAcuseService } from '../shared/services/pdf-acuse.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralidadesAperturaService {

  constructor(
    private httpClient: HttpClient,
    private pdfAcuseService: PdfAcuseService,
  ) { }

  // insertGeneralidadesForm(generalidadesForm: GeneralidadesApertura) {
  //   const headers = new HttpHeaders({'Content-Type': 'application/json'});
  //   this.httpClient.post<GeneralidadesAperturaResponse>( 
  //     environment.baseUrl + 'asunto/nuevo/generalidad/apertura/',
  //       generalidadesForm, {headers: headers})
  //       .subscribe((res) => {
  //       console.log(res);
  //   });
  // }

  insertGeneralidadesForm(
    data: GeneralidadesApertura,
    selectedFile: File
  ) {

    const json = JSON.stringify(data);
    const blob = new Blob([json], {
      type: 'application/json'
    });

    const formData = new FormData();

    formData.append("data", blob);
    formData.append("file", selectedFile, selectedFile.name);

    // const headers = new HttpHeaders({
    //   Accept: "application/json ,text/plain, */*",
    //   'Content-Type': 'multipart/form-data'
    // });

    this.httpClient.post<AsuntoResponse>(
      environment.baseUrl + 'asunto/nuevo/generalidad/apertura/',
      formData,
    ).subscribe((data) => {
      console.log('success', data);
      this.pdfAcuseService.generatePDF(data);
    },
      (error) => {
        //console.log('oops', error)
      });
  }

}
