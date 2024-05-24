import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Asunto } from '../interfaces/asuntos.interfaces';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EditTackingTableService {

  constructor(private http: HttpClient) { }


  updateTrackingTable(data:Asunto):Observable<Asunto>{
    const headers =new HttpHeaders({'Content-Type':'application/json'})
    return this.http.put<Asunto>(environment.baseUrl + environment.asuntoHistoricoEndpoint, data)
  }
  // updateTrackingTable(data:Asunto){
  //   const headers = new HttpHeaders({'Content-Type':'application/json'})
  //   this.http.put<Asunto>(
  //     environment.baseUrl + "",
  //     data,{headers:headers})
  //    .subscribe((res)=>{
  //     console.log(res);
  //    })
  // }

}
