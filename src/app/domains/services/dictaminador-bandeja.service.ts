import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { porAsignarRequest, tableAsuntosPorDictaminar } from '../interfaces/porAsignarRequest.interface';

@Injectable({
  providedIn: 'root'
})
export class DictaminadorBandejaService {
  constructor(private http: HttpClient) {}

  obtenerAsuntosAsignados(): Observable<tableAsuntosPorDictaminar[]> {
    const url = environment.baseUrl + environment.asuntosPorAsignarTable;
    const params: porAsignarRequest = {
      documento: 'REQUERIMIENTO',
      asignados: true
    };
    return this.http.post<tableAsuntosPorDictaminar[]>(url, params);
  }

  obtenerAsuntoPorId(id: string): Observable<tableAsuntosPorDictaminar> {
    const url = environment.baseUrl + environment.asuntosPorAsignarTable + `/${id}`;
    return this.http.get<tableAsuntosPorDictaminar>(url);
  }

  finalizarAtencion(idAsunto: number): Observable<string> {
    const url = environment.baseUrl + environment.finalizarAtencion;
    const params = {
      id_asunto: idAsunto,
      aprobado: true // Este campo es ignorado en este endpoint, pero es requerido por la estructura
    };
    
    // Configurar opciones para recibir respuesta como texto plano
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'text/plain, */*' // Aceptar texto plano
      }),
      responseType: 'text' as 'json' // Forzar el tipo de respuesta a texto
    };
    
    return this.http.post<string>(url, params, httpOptions);
  }
} 