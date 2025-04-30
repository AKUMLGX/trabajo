import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { asutosPorDictaminador, porAsignarRequest, tableAsuntosPorDictaminar } from '../interfaces/porAsignarRequest.interface';
import { porAsignarResponse } from '../interfaces/porAsignarResponse.interface';
import { Cards, CardsResponse } from '../interfaces/datosCards.interface';

@Injectable({
  providedIn: 'root'
})
export class CardsInfoBandejadeAtencionService {

  constructor(private http:HttpClient) { }

cardsInfo(){
  let tarjetUrl = environment.baseUrl+environment.cardsInfo
  return this.http.get<CardsResponse['data']>(tarjetUrl)

}

cardInfoPorAsignar(data:porAsignarRequest){
let tarjetUrl = environment.baseUrl+environment.cardsInfoPorAsignar
return this.http.post<porAsignarResponse>(tarjetUrl,data)
}

tablePorAsignar(data:porAsignarRequest):Observable<tableAsuntosPorDictaminar[]> {
const tarjetUrl = environment.baseUrl + environment.asuntosPorAsignarTable
return this.http.post<tableAsuntosPorDictaminar[]>(tarjetUrl ,data)
}

asutosPorDictaminar(data:asutosPorDictaminador):Observable<tableAsuntosPorDictaminar[]>{
  let tarjetUrl = environment.baseUrl + environment.asuntosPorDictaminar
  return this.http.post<tableAsuntosPorDictaminar[]>(tarjetUrl,data)
}

}
