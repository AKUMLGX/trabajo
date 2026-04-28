import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = environment.baseUrl;

  getData<T>(endpoint: string): Observable<T> {
    const url = `${this.urlBase}/${endpoint}`;
    return this.http.get<T>(url);
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
}