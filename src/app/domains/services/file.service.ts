import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class FileService {

  file: string = "";

  fileUpdated: EventEmitter<string> = new EventEmitter();

  constructor(private httpClient: HttpClient) {}

  getFile(): void{
    this.httpClient
      .get(
        environment.getPdfEndpoint + "/test", {responseType: 'text'}
      ).subscribe((data)=> {
        this.file = data;
        this.fileUpdated.emit(this.file);
      })
     
  }


}
