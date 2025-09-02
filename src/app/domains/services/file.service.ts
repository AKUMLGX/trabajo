import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  pdf = '';
  msg = '';

  pdfUpdated = new EventEmitter<string>();

  msgUpdated = new EventEmitter<string>();

  constructor(private httpClient: HttpClient) {}

  updatePdfFile(folio: string, fileName: string): void {
    const params = {
      folio: folio,
      file_name: fileName,
    };
    this.httpClient
      .get(environment.baseUrl + environment.getPdfEndpoint, { params: params, responseType: 'text' })
      .subscribe((data) => {
        this.pdf = data;
        this.pdfUpdated.emit(this.pdf);
      });
  }
 updatePdfFileBandejaAtencion(folio: string, fileName: string): void {
    let params = {
      folio: folio,
      file_name: fileName,
    };
    this.httpClient
      .get(environment.baseUrl + environment.getPdfEndpoint, { params: params, responseType: 'text' })
      .subscribe((data) => {
        this.pdf = data;
        this.pdfUpdated.emit(this.pdf);
      });
  }
  updateMsgFile(folio: string, fileName: string): void {
    const params = {
      folio: folio,
      file_name: fileName,
    };
    this.httpClient
      .get(environment.baseUrl + environment.getMsgEndpoint, { params: params, responseType: 'text' })
      .subscribe((data) => {
        this.msg = data;
        this.msgUpdated.emit(this.msg);
      });
  }

  /**
   * Descarga un PDF consultándolo por folio y nombre de archivo.
   * Usa el mismo endpoint que el visor, pero en lugar de emitir el evento,
   * construye el Blob y dispara una descarga automática.
   */
  downloadPdfFileBandejaAtencion(
    folio: string,
    fileName: string,
    suggestedName?: string
  ): void {
    const params = {
      folio: folio,
      file_name: fileName,
    };
    this.httpClient
      .get(environment.baseUrl + environment.getPdfEndpoint, { params: params, responseType: 'text' })
      .subscribe((data) => {
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobURL = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobURL;
        link.download = (suggestedName || fileName || 'documento.pdf').toString();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobURL);
      });
  }

  printPdf(folio: string, fileName: string): void {
    const params = {
      folio: folio,
      file_name: fileName,
    };
    this.httpClient
      .get(environment.baseUrl + environment.getPdfEndpoint, { params: params, responseType: 'text' })
      .subscribe((data) => {
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobURL = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = blobURL;
        document.body.appendChild(iframe);
        if (iframe.contentWindow !== null) iframe.contentWindow.print();
      });
  }
}
