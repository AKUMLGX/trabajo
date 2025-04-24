import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { asutosPorDictaminador, porAsignarRequest, tableAsuntosPorDictaminar } from '../interfaces/porAsignarRequest.interface';
import { porAsignarResponse } from '../interfaces/porAsignarResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class CardsInfoBandejadeAtencionService {

  constructor(private http:HttpClient) { }

cardsInfo():Observable<any[]>{
  let tarjetUrl = environment.baseUrl+environment.cardsInfo
  return this.http.get<any[]>(tarjetUrl)

}

cardInfoPorAsignar(data:porAsignarRequest){
let tarjetUrl = environment.baseUrl+environment.cardsInfoPorAsignar
return this.http.post<porAsignarResponse>(tarjetUrl,data)
}

asutosPorDictaminar(data:asutosPorDictaminador):Observable<tableAsuntosPorDictaminar[]>{
  let tarjetUrl = environment.baseUrl + environment.asuntosPorDictaminar
  return this.http.post<tableAsuntosPorDictaminar[]>(tarjetUrl,data)
}

}
