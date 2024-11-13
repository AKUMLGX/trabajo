
import { Injectable } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { EstadisticosRequest} from '../interfaces/estadisticosRequest.interface';
import { EstadisticosResponse } from '../interfaces/estadisticosResponse.interface';


@Injectable({
  providedIn: 'root'
})
export class EstadisticoService {

  constructor(private http: HttpClient){ }


  getQuerybyDay(data:EstadisticosRequest)
  {
    let targetUrl = environment.baseUrl + environment.chartPieEstaditicos
    return this.http.post<EstadisticosResponse>(targetUrl,data,
      )
  }
}
