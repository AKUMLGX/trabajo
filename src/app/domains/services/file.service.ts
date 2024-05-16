import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  file: string = '';

  fileUpdated: EventEmitter<string> = new EventEmitter();

  constructor(private httpClient: HttpClient) {}

  updatePdfFile(folio: string, fileName: string): void {
    let params = {
      folio: folio,
      file_name: fileName,
    };
    this.httpClient
      .get(environment.baseUrl + environment.getPdfEndpoint, { params: params, responseType: 'text' })
      .subscribe((data) => {
        this.file = data;
        this.fileUpdated.emit(this.file);
      });
  }

  printFile(folio: string, fileName: string): void {
    let params = {
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
        let blobURL = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = blobURL;
        document.body.appendChild(iframe);
        if (iframe.contentWindow !== null) iframe.contentWindow.print();
      });
  }
}
