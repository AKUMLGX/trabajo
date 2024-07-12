import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PdfAcuseService } from '../shared/services/pdf-acuse.service';
import { CivilApertura } from '../interfaces/civil-apertura';

@Injectable({
  providedIn: 'root'
})
export class CivilAperturaService {

  constructor(
    private httpClient: HttpClient,
    private pdfAcuseService: PdfAcuseService,
  ) { }

  insertCivilForm(data: CivilApertura, selectedFile: File) {

    const json = JSON.stringify(data);
    const blob = new Blob([json], {
      type: 'application/json'
    });

    const formData = new FormData();

    formData.append("data", blob);
    formData.append("file", selectedFile, selectedFile.name);

    this.httpClient.post(
      environment.baseUrl + 'asunto/nuevo/civil/apertura/',
      formData,
      { responseType: 'text' }
    ).subscribe((data) => {
      this.pdfAcuseService.generatePDF(data);
    },
      (error) => {

    });

  }

}
