import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
} 