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

  // updateTrackingTable(data:Asunto, selectedFile:File ):Observable<string>{
  //   let  targetUrl  =  environment.baseUrl
  //   if (data.id_asunto_historico !== null) {
  //     targetUrl =  environment.baseUrl +    environment.updateTableHistorico
  //   }else if(data.id_asunto_nuevo !== null){
  //     targetUrl= environment.baseUrl +  environment.updateTableNuevo
  //   }



  //   const type = 'application/json'
  //   const json = JSON.stringify(data);
  //   const blob = new Blob([json],

  //      {
  //     type: type
  //   });

  //   const formData = new FormData();

  //   formData.append('data', blob);


  //   if (selectedFile && selectedFile.size > 0 ) {
  //   formData.append('file', selectedFile, selectedFile.name);

  //   }




  //   // console.log("DATA",data);

  //    return this.http.patch(targetUrl,
  //     formData, { responseType: 'text'} );

  // }

  updateTrackingTable(data:Asunto, selectedFile? :File  ):Observable<string>{

    let  targetUrl  =  environment.baseUrl
    if (data.id_asunto_historico !== null) {
      targetUrl =  environment.baseUrl +    environment.updateTableHistorico
    }else if(data.id_asunto_nuevo !== null){
      targetUrl= environment.baseUrl +  environment.updateTableNuevo
    }

    const type = 'application/json'
    const json = JSON.stringify(data);

    let formData: FormData;
    if (selectedFile) {
        const blob = new Blob([json],
          {type}
        );
        formData = new FormData();
        formData.append('data', blob);
        formData.append('file', selectedFile, selectedFile.name);
    }else  {
      formData = new FormData();
        formData.append('data', json);

    }

        return this.http.patch(targetUrl,
      formData, { responseType: 'text'} );

  }



  }



  // updateDocumento( data: Asunto,selectedFile: File,): Observable<string> {
  //   const type = 'application/json'
  //   const json = JSON.stringify(data);
  //   const blob = new Blob([json], {
  //     type: type
  //   });

  //   const formData = new FormData();

  //   formData.append('data', blob);
  //   formData.append('file', selectedFile, selectedFile.name);

  //   const targetUrlDoc = `${environment.baseUrl}${environment.updateDocumentoEscaneado}`;
  //   return this.http.post(targetUrlDoc, formData, { responseType: 'text' });
  // }





