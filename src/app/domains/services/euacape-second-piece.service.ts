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
    euacapeForm: EuacapeSecondPiece, 
    selectedFile: File
  ) {

    const euacapeFormJson = JSON.stringify(euacapeForm);
    const euacapeFormBlob = new Blob([euacapeFormJson], {
      type: 'application/json'
    });

    const formData = new FormData();

    formData.append('file', selectedFile, selectedFile.name);
    formData.append('euacapeForm', euacapeFormBlob);

    const headers = new HttpHeaders({'Content-Type': 'multipart/form-data'});

    this.httpClient.post(
      environment.baseUrl + 'asunto/nuevo/euacape/segunda_pieza/',
      formData, {headers: headers}
    ).subscribe((res) => {
        console.log(res);
    });
  }

}
