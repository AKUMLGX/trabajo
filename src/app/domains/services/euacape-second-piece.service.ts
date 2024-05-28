import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EuacapeSecondPiece } from '../interfaces/euacape-second-piece';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EuacapeSecondPieceService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  insertSecondPieceEuacapeForm(
    data: EuacapeSecondPiece, 
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
      environment.baseUrl + 'asunto/nuevo/euacape/segunda_pieza/',
      formData, 
    ).subscribe((res) => {
        console.log(res);
    });
  }

}
