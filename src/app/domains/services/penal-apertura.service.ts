import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PdfAcuseService } from '../shared/services/pdf-acuse.service';
import { PenalApertura } from '../interfaces/penal-apertura';

@Injectable({
  providedIn: 'root'
})
export class PenalAperturaService {

  constructor(
    private httpClient: HttpClient,
    private pdfAcuseService: PdfAcuseService,
  ) { }

  insertPenalForm(data: PenalApertura, selectedFile: File) {

    const json = JSON.stringify(data);
    const blob = new Blob([json], {
      type: 'application/json'
    });

    const formData = new FormData();

    formData.append("data", blob);
    formData.append("file", selectedFile, selectedFile.name);

    this.httpClient.post(
      environment.baseUrl + 'asunto/nuevo/penal/apertura/',
      formData,
      { responseType: 'text' }
    ).subscribe((data) => {
      this.pdfAcuseService.generatePDF(data);
    },
      (error) => {

    });

  }

}
