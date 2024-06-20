import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EuacapeSecondPiece } from '../interfaces/euacape-second-piece';
import { environment } from '../../../environments/environment';
import { PdfAcuseService } from '../shared/services/pdf-acuse.service';
import { AsuntoResponse } from '../interfaces/ausuntos-response.interface';

@Injectable({
  providedIn: 'root'
})
export class EuacapeSecondPieceService {

  constructor(
    private httpClient: HttpClient,
    private pdfAcuseService: PdfAcuseService,
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
      { responseType: 'text' }
    ).subscribe((data) => {
      this.pdfAcuseService.generatePDF(data);
    },
      (error) => {
      });
  }

}
