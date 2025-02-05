
import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DownloadExcel, EstadisticosRequest} from '../interfaces/estadisticosRequest.interface';
import { EstadisticosResponse } from '../interfaces/estadisticosResponse.interface';
import { EstadisticasDiarias } from '../interfaces/estadisticosTableResponse.interface';
import { Observable, map } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class EstadisticoService {
  constructor(private http: HttpClient){ }

  getQuerybyDay(data:EstadisticosRequest)
  {
    let targetUrl = environment.baseUrl + environment.chartPieEstaditicos
    return this.http.post<EstadisticosResponse ['data']>(targetUrl,data)
  }

  getConteoDia(data:EstadisticosRequest):Observable <EstadisticasDiarias[]>{
    let targetUrl = environment.baseUrl + environment.tableEstaditicas_Diarias
    return this.http.post<{Datos:[]}>(targetUrl,data).pipe(
      map(resp=>
        resp.Datos.map(item =>({
          fecha_recepcion: item[0] ?? 'Sin fecha',
          total_requerimientos: item[1],
          total: item[1]
        }))
      )
    )
  }


  donwnloadExcel(startDate:string,endDate:string,documento:string, administracion:string ){
    let url = environment.baseUrl + environment.generateEstadistico;
    let params: DownloadExcel = {
      fecha_inicial: startDate,
      fecha_final: endDate,
      documento:documento,

      administracion:administracion
    }

   this.http.post(url,params,{responseType:"text"}).subscribe((e)=>{
    const byteCharacters = atob(e);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      let type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Estadistico.xlsx`;
      link.click();
   })
  }

}
