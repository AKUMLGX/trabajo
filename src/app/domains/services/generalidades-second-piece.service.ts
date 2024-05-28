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
    data: GeneralidadesSecondPiece, 
    selectedFile: File
  ) {

    const json = JSON.stringify(data);
    const blob = new Blob([json], {
      type: 'application/json'
    });

    const formData = new FormData();

    formData.append("data", blob);
    formData.append("file", selectedFile, selectedFile.name);

    this.httpClient.post(
      environment.baseUrl + 'asunto/nuevo/generalidad/segunda_pieza/',
      formData, 
    ).subscribe((res) => {
        console.log(res);
    });
  }

}
