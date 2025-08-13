import { AsuntoPorAsigacionResponseParcial, AsuntoPorAsigacionResponseTotal, AsuntoReponseEnTramite, AsuntoResponseParcial, AsuntoResponseTotal } from './../interfaces/asuntoPorAtencionResponse.interface';
import { AsuntoPorAtencionEnTramiteRequest, AsuntoPorAtencionParcialRequest, AsuntoPorAtencionTotalRequest, AsuntoPorEstadoAtencionRequest, AsuntoPorEstadoAtencionResponse } from './../interfaces/asuntoPorAtencion.interface';
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
import { AsuntoResponse } from '../interfaces/ausuntos-response.interface';

@Injectable({
  providedIn: 'root'
})
export class CardsInfoBandejadeAtencionService {

  constructor(private http:HttpClient) { }

cardsInfo(){
  const tarjetUrl = environment.baseUrl+environment.cardsInfo
  // Añadir header para evitar loader en esta petición crítica de inicialización
  const headers = new HttpHeaders().set('X-Skip-Loader', 'true');
  return this.http.get<CardsResponse['data']>(tarjetUrl, { headers })

}

cardInfoPorAsignar(data:porAsignarRequest){
const tarjetUrl = environment.baseUrl+environment.cardsInfoPorAsignar
return this.http.post<porAsignarResponse>(tarjetUrl,data)
}

tablePorAsignar(data:porAsignarRequest):Observable<tableAsuntosPorDictaminar[]> {
const tarjetUrl = environment.baseUrl + environment.asuntosPorAsignarTable
return this.http.post<tableAsuntosPorDictaminar[]>(tarjetUrl ,data)
}

asutosPorDictaminar(data:asutosPorDictaminador):Observable<tableAsuntosPorDictaminar[]>{
  const tarjetUrl = environment.baseUrl+environment.asuntosPorDictaminar
  return this.http.post<tableAsuntosPorDictaminar[]>(tarjetUrl,data)
}

// Nuevo método para obtener asuntos que requieren aprobación
asuntosPorAprobar(data:asutosPorDictaminador):Observable<tableAsuntosPorDictaminar[]>{
  const tarjetUrl = environment.baseUrl+environment.asuntosPorDictaminar
  // Ya no se usa requiere_aprobacion
  return this.http.post<tableAsuntosPorDictaminar[]>(tarjetUrl, data)
}

usuariosPorAdminitracion(){
  const tarjetURL = environment.baseUrl+environment.usuariosPorAdministracion;
  return this.http.get<usuariosPorAdministracion[]>(tarjetURL)
}

asignarAsunto(data:AsignarAsuntoRequest):Observable<string>{
  const tarjetURL = environment.baseUrl+environment.asignarAsunto;
  return this.http.post(tarjetURL,data,{responseType:"text"})
 }

 enTramiteTableCard(data:AsuntoPorAtencionEnTramiteRequest):Observable<AsuntoReponseEnTramite[]>{
    const tarejetURL= environment.baseUrl + environment.enTramiteTableCard;
    return this.http.post<AsuntoReponseEnTramite[]>(tarejetURL,data)
 }

 parcialTableCard(data:AsuntoPorAtencionParcialRequest):Observable<AsuntoResponseParcial[]> {
    const tarjetURL = environment.baseUrl + environment.parcialTableCard;
    return this.http.post<AsuntoResponseParcial[]>(tarjetURL,data)
 }

 totalTableCard(data:AsuntoPorAtencionTotalRequest):Observable<AsuntoResponseTotal[]>{
  const tarjetURL = environment.baseUrl + environment.totalTableCard;
  return this.http.post<AsuntoResponseTotal[]>(tarjetURL,data)
 }

 descargarExcelEnTramite(data:AsuntoPorAtencionParcialRequest){
  const tarjetURL = environment.baseUrl + environment.downloadExecelEnTramite;
  const params: DownloadExcelCards={
     atencion:data.atencion,
     documento:data.documento
  }
   this.http.post(tarjetURL,params,{responseType:'text'}).subscribe((response)=>{
     const byteCharacters = atob(response);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
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
    const params: DownloadExcelCards={
      atencion:data.atencion,
      documento:data.documento
    }
    this.http.post(tarjetURL,params,{responseType:'text'}).subscribe((response)=>{
       const byteCharacters = atob(response);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
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
    const params: DownloadExcelCards={
      atencion: data.atencion,
      documento: data.documento
    }
    this.http.post(tarejetURL,params,{responseType:'text'}).subscribe((response)=>{
       const byteCharacters = atob(response);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Total.xlsx`;
      link.click();
    })
 }

 getAsuntosPorEstadoAtencion(data: AsuntoPorEstadoAtencionRequest): Observable<AsuntoPorEstadoAtencionResponse> {
   const tarjetURL = environment.baseUrl + 'asunto/atencion/get_asunto_por_estado_atencion/';
   return this.http.post<AsuntoPorEstadoAtencionResponse>(tarjetURL, data);
 }

 // Nuevo método para asignar asuntos a administración sin aprobación previa
 asignarAsuntoAdministracion(asunto: any): Observable<string> {
   const tarjetURL = environment.baseUrl + environment.asignarAdministracion;
   return this.http.post(tarjetURL, asunto, { responseType: 'text' });
 }

}
