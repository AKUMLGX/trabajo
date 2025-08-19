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
  return this.http.post<any[]>(tarjetUrl ,data).pipe(
    map((items:any[]) => {
      console.log('🔍 DEBUG tablePorAsignar - Items recibidos del backend:', items);
      return items.map((item:any) => {
        console.log('🔍 DEBUG tablePorAsignar - Item individual:', item);
        const contenedor = item?.asunto ?? item;
        const datos = contenedor?.datos ?? contenedor?.Nuevo ?? contenedor?.Historico ?? contenedor ?? {};

        const idAsunto = datos?.id_asunto ?? datos?.id_asunto_nuevo ?? datos?.id_asunto_historico ?? 0;
        const esHistorico = (contenedor?.tipo && String(contenedor.tipo).toLowerCase() === 'historico') || Boolean(datos?.id_asunto_historico);

        const normalizado: any = {
          folio_interno: datos?.folio_interno ?? '',
          folio_scanner: datos?.folio_scanner ?? 0,
          carpeta_investigacion: datos?.carpeta_investigacion ?? '',
          oficio: datos?.oficio ?? '',
          persona_relacionada: datos?.persona_relacionada ?? '',
          fecha_recepcion: datos?.fecha_recepcion ?? '',
          id_administracion_fk: datos?.id_administracion_fk ?? 0,
          id_documento_fk: datos?.id_documento_fk ?? 0,
          id_atencion_fk: datos?.id_atencion_fk ?? 0,
          turno_jefatura: datos?.turno_jefatura ?? '',
          autoridad_remitente: datos?.autoridad_remitente ?? '',
          id_asunto: idAsunto,
          es_historico: esHistorico,
          // Permitir null para soportar "Sin plazo definido"
          plazo_atencion: (datos?.plazo_atencion ?? null) as any,
          // Extras útiles en UI
          id_asignacion: item?.id_asignacion ?? undefined,
          tipo_asunto: item?.tipo_asunto ?? (contenedor?.tipo ? String(contenedor.tipo).toLowerCase() : undefined),
          rfc_dictaminador: item?.rfc_dictaminador ?? undefined,
          nombre_dictaminador: item?.rfc_asignado ?? item?.nombre_dictaminador ?? undefined,
        };

        console.log('🚀 DEBUG tablePorAsignar - Objeto normalizado:', normalizado);
        return normalizado as tableAsuntosPorDictaminar;
      })
    })
  );
 }

  // Conteo total por estado de atención
  contarAsuntosPorEstadoAtencion(data: { documento: string; estado_atencion: string }): Observable<{ total: number }> {
    const url = environment.baseUrl + 'asunto/atencion/get_asunto_por_estado_atencion/total';
    return this.http.post<{ total: number }>(url, data);
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

 asignarAsunto(data: any): Observable<string> {
  const tarjetURL = environment.baseUrl + environment.asignarAsunto;

  // Soportar ambos formatos: {asunto, rfc_asignado,...} y plano
  const fuente = data?.asunto ?? data ?? {};
  const id_asignacion = fuente.id_asignacion ?? data?.id_asignacion;
  const id_asunto = fuente.id_asunto ?? data?.id_asunto;
  const es_historico = fuente.es_historico ?? data?.es_historico ?? false;
  const tipo_asunto = data?.tipo_asunto ?? (es_historico ? 'historico' : 'nuevo');
  const rfc = data?.rfc_asignado ?? data?.rfc ?? '';
  const estado_atencion = data?.estado_atencion ?? 2;
  const fecha_asignacion = data?.fecha_asignacion ?? null;

  if (id_asignacion == null || id_asunto == null || !rfc) {
    console.error('❌ asignarAsunto: payload incompleto', { id_asignacion, id_asunto, rfc, data });
    throw new Error('Datos incompletos para asignar el asunto');
  }

  const payload = {
    id_asignacion,
    rfc,
    tipo_asunto,
    id_asunto,
    estado_atencion,
    fecha_asignacion,
  };

  console.log('🚀 Payload para asignar_asunto:', payload);
  return this.http.post(tarjetURL, payload, { responseType: 'text' });
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
