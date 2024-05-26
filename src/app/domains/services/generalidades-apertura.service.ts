import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GeneralidadesApertura } from '../interfaces/generalidades-apertura';
import { environment } from '../../../environments/environment';
import { GeneralidadesAperturaResponse } from '../interfaces/generalidades-apertura-response';

@Injectable({
  providedIn: 'root'
})
export class GeneralidadesAperturaService {

  constructor(
    private httpClient: HttpClient,
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
    generalidadesForm: GeneralidadesApertura, 
    selectedFile: File
  ) {

    const generalidadesFormJson = JSON.stringify(generalidadesForm);
    const generalidadesFormBlob = new Blob([generalidadesFormJson], {
      type: 'application/json'
    });

    const formData = new FormData();

    formData.append('file', selectedFile, selectedFile.name);
    formData.append('generalidadesForm', generalidadesFormBlob);

    const headers = new HttpHeaders({'Content-Type': 'multipart/form-data'});

    this.httpClient.post(
      environment.baseUrl + 'asunto/nuevo/generalidad/apertura/',
      formData, {headers: headers}
    ).subscribe((res) => {
        console.log(res);
    });
  }

}
