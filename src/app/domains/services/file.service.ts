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

  updateFile(): void {
    this.httpClient
      .get(environment.getPdfEndpoint + '/test.pdf', { responseType: 'text' })
      .subscribe((data) => {
        this.file = data;
        this.fileUpdated.emit(this.file);
      });
  }

  printFile(): string {
    this.httpClient
      .get(environment.getPdfEndpoint + '/test.pdf', { responseType: 'text' })
      .subscribe((data) => {
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        let blobURL = URL.createObjectURL(blob);
        let myWindow = window.open(blobURL);
        if (myWindow !== null) myWindow.print();
        return data;
      });
    return '';
  }
}
