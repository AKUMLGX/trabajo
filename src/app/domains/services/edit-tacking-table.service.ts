import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Asunto } from '../interfaces/asuntos.interfaces';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AsuntoResponse } from '../interfaces/ausuntos-response.interface';

@Injectable({
  providedIn: 'root'
})
export class EditTackingTableService {

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  constructor(private http: HttpClient) { }

  updateTrackingTable(data:Asunto):Observable<string>{
    let  targetUrl  = environment.baseUrl
    if (data.id_asunto_historico !== null) {
      targetUrl =  environment.baseUrl +    environment.updateTableHistorico
    }else if(data.id_asunto_nuevo !==null){
      targetUrl= environment.baseUrl +  environment.updateTableNuevo
    }
    // console.log("DATA",data);

     return this.http.patch(targetUrl,
      data, { responseType: 'text'} );

  }

  // updateDocumentoEscaneado(selectedFile: File, data: Asunto):Observable<any> {
  //     const type = "application/json"
  //     const json = JSON.stringify(data);
  //     const blob = new Blob([json], {
  //       type: type
  //     });
  //     const formData = new FormData()
  //     formData.append("data", blob);
  //     formData.append("file", selectedFile, selectedFile.name)

  //     let targetUrlDoc = environment.baseUrl + environment.updateDocumentoEscaneado
  //     return this.http.post(targetUrlDoc,formData,{ responseType:"text"})

  //   }

  updateDocumento( data: Asunto,selectedFile: File,): Observable<string> {
    const type = 'application/json'
    const json = JSON.stringify(data);
    const blob = new Blob([json], {
      type: type
    });

    const formData = new FormData();

    formData.append('data', blob);
    formData.append('file', selectedFile, selectedFile.name);

    const targetUrlDoc = `${environment.baseUrl}${environment.updateDocumentoEscaneado}`;
    return this.http.post(targetUrlDoc, formData, { responseType: 'text' });
  }


   }


