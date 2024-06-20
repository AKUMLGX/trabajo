import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RespuestaSecondPiece } from '../interfaces/respuesta-second-piece';
import { PdfAcuseService } from '../shared/services/pdf-acuse.service';
import { AsuntoResponse } from '../interfaces/ausuntos-response.interface';

@Injectable({
  providedIn: 'root'
})
export class RespuestaSecondPieceService {

  constructor(
    private httpClient: HttpClient,
    private pdfAcuseService: PdfAcuseService,
  ) { }

  insertSecondPieceRespuestaForm(
    data: RespuestaSecondPiece,
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
      environment.baseUrl + 'asunto/nuevo/respuesta/segunda_pieza/',
      formData,
      { responseType: 'text' }
    ).subscribe((data) => {
      this.pdfAcuseService.generatePDF(data);

    }, (error) => {
    });
  }

}
