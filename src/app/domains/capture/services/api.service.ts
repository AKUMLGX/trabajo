import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = environment.baseUrl;
  private readonly urlCatalogos ='https://balam.sat.gob.mx/tlalcalli/api/v1';
  // private readonly urlCatalogos ='http://localhost:8090/tlalcalli/api/v1';


private buildUrl(endpoint: string): string {
  return `${this.urlBase.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
}


getData<T>(endpoint: string): Observable<HttpResponse<T>> {
  return this.http.get<T>(this.buildUrl(endpoint), {
    observe: 'response',
  });
}

  postData<T>(endpoint: string, body: object): Observable<HttpResponse<T>> {
    const url = `${this.urlBase}/${endpoint}`;
    return this.http.post<T>(url, body, {
      observe: 'response',
    });
  }

  postDataForBase64(
    endpoint: string,
    body: object
  ): Observable<HttpResponse<string>> {
    const url = `${this.urlBase}/${endpoint}`;
    return this.http.post(url, body, {
      responseType: 'text',
      observe: 'response',
    });
  }

  putData<T>(
    endpoint: string,
    body: object,
    id: number | string
  ): Observable<HttpResponse<T>> {
    const url = `${this.urlBase}/${endpoint}/${id}`;
    return this.http.put<T>(url, body, {
      observe: 'response',
    });
  }

  patchData<T>(
    endpoint: string,
    body: object = {}
  ): Observable<HttpResponse<T>> {
    const url = `${this.urlBase}/${endpoint}`;
    return this.http.patch<T>(url, body, {
      observe: 'response',
    });
  }

  deleteData<T>(
    endpoint: string,
    id: number | string
  ): Observable<HttpResponse<T>> {
    const url = `${this.urlBase}/${endpoint}/${id}`;
    return this.http.delete<T>(url, {
      observe: 'response',
    });
  }

  getBlobData(endpoint: string): Observable<Blob> {
    const url = `${this.urlBase}/${endpoint}`;
    return this.http.get(url, {
      responseType: 'blob',
    });
  }

  postBlobData(endpoint: string, body: object): Observable<Blob> {
    const url = `${this.urlBase}/${endpoint}`;
    return this.http.post(url, body, {
      responseType: 'blob',
    });
  }

  get baseUrl(): string {
    return this.urlBase;
  }


  //ENDPOINTS MODULO DE CAPTURA STEPPER
  postTemporal<T>(endpoint: string, body: object): Observable<HttpResponse<T>> {
    return this.http.post<T>(this.buildUrl(endpoint), body, {
    observe: 'response',
    });
  }

  deleteTemporal<T>(endpoint: string,body: object): Observable<HttpResponse<T>> {
    return this.http.delete<T>(this.buildUrl(endpoint), {
    body,
    observe: 'response',
    });
  }

  //ENDPOINTS DE LOS APLICATIVOS, MODULO CENTRO DE CONTROL
  putDataBody<T>(endpoint: string, body: object): Observable<HttpResponse<T>> {
  return this.http.put<T>(this.buildUrl(endpoint), body, {
    observe: 'response',
    });
  }

updateAplicativo<T>(body: object): Observable<HttpResponse<T>> {
  return this.http.put<T>(
    this.buildUrl('catalogo/update_aplicativos'),
    body,
    { observe: 'response' }
  );
}

deleteAplicativo<T>(id: number | string): Observable<HttpResponse<T>> {
  return this.http.put<T>(
    this.buildUrl(`catalogo/aplicativos/${id}`),
    {},
    { observe: 'response' }
  );
}



// ENDPOINT ATENCIÓN TLALCALLI
// crearAtencion<T>(body: object): Observable<HttpResponse<T>> {
//   return this.http.post<T>(
//     this.buildUrl('atencion'),
//     body,
//     { observe: 'response' }
//   );
//   }
crearAtencion<T>(body: object): Observable<HttpResponse<T>> {

  const url = 'https://balam.sat.gob.mx/tlalcalli/api/v1/atencion';

  console.log('POST URL:', url);
  console.log('BODY =>', body);

  return this.http.post<T>(
    url,
    body,
    { observe: 'response' }
  );
}

getEstadisticosAtencion<T>(): Observable<HttpResponse<T>> {
  return this.http.get<T>(
    'https://balam.sat.gob.mx/tlalcalli/api/v1/atencion/estadisticos_atencion',
    { observe: 'response' }
  );
  }





  // CATÁLOGO GENERALES

getGenerales<T>(): Observable<HttpResponse<T>> {
  const url = `${this.urlCatalogos}/catalogo/generales`;

  console.log('GET GENERALES:', url);

  return this.http.get<T>(url, {
    observe: 'response'
  });
}

crearGeneral<T>(body: object): Observable<HttpResponse<T>> {
  const url = `${this.urlCatalogos}/catalogo/generales`;

  console.log('POST GENERAL:', url);
  console.log(body);

  return this.http.post<T>(url, body, {
    observe: 'response'
  });
}

actualizarGeneral<T>(body: object): Observable<HttpResponse<T>> {
  const url = `${this.urlCatalogos}/catalogo/update_generales`;

  console.log('PUT GENERAL:', url);
  console.log(body);

  return this.http.put<T>(url, body, {
    observe: 'response'
  });
}

eliminarGeneral<T>(id: number | string): Observable<HttpResponse<T>> {
  const url = `${this.urlCatalogos}/catalogo/generales/${id}`;

  console.log('DELETE GENERAL:', url);

  return this.http.put<T>(url, {}, {
    observe: 'response'
  });
}




// CATÁLOGO CENTRALES

getCentrales<T>(): Observable<HttpResponse<T>> {
  const url = `${this.urlCatalogos}/catalogo/central`;

  console.log('GET CENTRALES:', url);

  return this.http.get<T>(url, {
    observe: 'response'
  });
}

crearCentral<T>(body: object): Observable<HttpResponse<T>> {
  const url = `${this.urlCatalogos}/catalogo/central`;

  console.log('POST CENTRAL:', url);
  console.log(body);

  return this.http.post<T>(url, body, {
    observe: 'response'
  });
}

actualizarCentral<T>(body: object): Observable<HttpResponse<T>> {
  const url = `${this.urlCatalogos}/catalogo/update_central`;

  console.log('PUT CENTRAL:', url);
  console.log(body);

  return this.http.put<T>(url, body, {
    observe: 'response'
  });
}

eliminarCentral<T>(id: number | string): Observable<HttpResponse<T>> {
  const url = `${this.urlCatalogos}/catalogo/central/${id}`;

  console.log('DELETE CENTRAL:', url);

  return this.http.put<T>(url, {}, {
    observe: 'response'
  });
  }
}
