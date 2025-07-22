import { AsuntoPorAsigacionResponseParcial, AsuntoPorAsigacionResponseTotal } from './../interfaces/asuntoPorAtencionResponse.interface';
import { AsuntoPorAtencionEnTramiteRequest, AsuntoPorAtencionParcialRequest, AsuntoPorAtencionTotalRequest } from './../interfaces/asuntoPorAtencion.interface';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { asutosPorDictaminador, porAsignarRequest, tableAsuntosPorDictaminar } from '../interfaces/porAsignarRequest.interface';
import { porAsignarResponse } from '../interfaces/porAsignarResponse.interface';
import { CardsResponse } from '../interfaces/datosCards.interface';
import { usuariosPorAdministracion } from '../interfaces/usuarios-Por-administracion.interface';
import { AsignarAsuntoRequest } from '../interfaces/asiganar-AsuntoRequest.interface';
import { AsuntoPorAsigacionResponseEnTramite } from '../interfaces/asuntoPorAtencionResponse.interface';
import { DownloadExcelCards } from '../interfaces/descargarExcelCards.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardsInfoBandejadeAtencionService {

  constructor(private http:HttpClient) { }

cardsInfo(){
  let tarjetUrl = environment.baseUrl+environment.cardsInfo
  // Añadir header para evitar loader en esta petición crítica de inicialización
  const headers = new HttpHeaders().set('X-Skip-Loader', 'true');
  return this.http.get<CardsResponse['data']>(tarjetUrl, { headers })

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
  let tarjetUrl = environment.baseUrl+environment.asuntosPorDictaminar
  return this.http.post<tableAsuntosPorDictaminar[]>(tarjetUrl,data)
}

// Nuevo método para obtener asuntos que requieren aprobación
asuntosPorAprobar(data:asutosPorDictaminador):Observable<tableAsuntosPorDictaminar[]>{
  let tarjetUrl = environment.baseUrl+environment.asuntosPorDictaminar
  const params = { ...data, requiere_aprobacion: true };
  return this.http.post<tableAsuntosPorDictaminar[]>(tarjetUrl, params)
}

usuariosPorAdminitracion(){
  const tarjetURL = environment.baseUrl+environment.usuariosPorAdministracion;
  return this.http.get<usuariosPorAdministracion[]>(tarjetURL)
}

asignarAsunto(data:AsignarAsuntoRequest):Observable<string>{
  const tarjetURL = environment.baseUrl+environment.asignarAsunto;
  return this.http.post(tarjetURL,data,{responseType:"text"})
 }

 enTramiteTableCard(data:AsuntoPorAtencionEnTramiteRequest):Observable<AsuntoPorAsigacionResponseEnTramite[]>{
    const tarejetURL= environment.baseUrl + environment.enTramiteTableCard;
    return this.http.post<AsuntoPorAsigacionResponseEnTramite[]>(tarejetURL,data)
 }

 parcialTableCard(data:AsuntoPorAtencionParcialRequest):Observable<AsuntoPorAsigacionResponseParcial[]> {
    const tarjetURL = environment.baseUrl + environment.parcialTableCard;
    return this.http.post<AsuntoPorAsigacionResponseParcial[]>(tarjetURL,data)
 }

 totalTableCard(data:AsuntoPorAtencionTotalRequest):Observable<AsuntoPorAsigacionResponseTotal[]>{
  const tarjetURL = environment.baseUrl + environment.totalTableCard;
  return this.http.post<AsuntoPorAsigacionResponseTotal[]>(tarjetURL,data)
 }

 descargarExcelEnTramite(data:AsuntoPorAtencionParcialRequest){
  const tarjetURL = environment.baseUrl + environment.downloadExecelEnTramite;
  let params: DownloadExcelCards={
     atencion:data.atencion,
     documento:data.documento
  }
   this.http.post(tarjetURL,params,{responseType:'text'}).subscribe((response)=>{
     const byteCharacters = atob(response);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      let type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `En_Tramite.xlsx`;
      link.click();
   })
 }

 descargarExcelParcial(data:AsuntoPorAtencionParcialRequest){
    const tarjetURL = environment.baseUrl +environment.downloadExecelParcial;
    let params: DownloadExcelCards={
      atencion:data.atencion,
      documento:data.documento
    }
    this.http.post(tarjetURL,params,{responseType:'text'}).subscribe((response)=>{
       const byteCharacters = atob(response);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      let type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Parcial.xlsx`;
      link.click();
    })
 }

 descargarExcelTotal(data:AsuntoPorAtencionTotalRequest){
    const tarejetURL= environment.baseUrl + environment.downloadExecelTotal;
    let params: DownloadExcelCards={
      atencion: data.atencion,
      documento: data.documento
    }
    this.http.post(tarejetURL,params,{responseType:'text'}).subscribe((response)=>{
       const byteCharacters = atob(response);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      let type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Total.xlsx`;
      link.click();
    })
 }

}
