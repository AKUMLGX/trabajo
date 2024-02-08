import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class FileService {

  file: string = "";

  constructor(private httpClient: HttpClient) {}

  getFile(): void{
    this.httpClient
      .get(
        environment.getPdfEndpoint + "/test", {responseType: 'text'}
      ).subscribe((data)=> {
        this.file = data;
      })
     
  }


}
