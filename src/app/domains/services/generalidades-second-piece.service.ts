import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GeneralidadesSecondPiece } from '../interfaces/generalidades-second-piece';

@Injectable({
  providedIn: 'root'
})
export class GeneralidadesSecondPieceService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  insertSecondPieceGeneralidadesForm(
    generalidadesForm: GeneralidadesSecondPiece, 
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
