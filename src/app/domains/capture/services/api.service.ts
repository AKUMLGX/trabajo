import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private urlBase = environment.baseUrl;
  constructor(protected http: HttpClient) {}

  getData<T>(endpoint: string): Observable<HttpResponse<any>> {
    const url = `${this.urlBase}/${endpoint}`;
    return this.http.get<any>(url);
  }

  postData<T>(endpoint: string, body: {}): Observable<HttpResponse<any>> {
    const url = `${this.urlBase}/${endpoint}`;
    return this.http.post<any>(url, body, {
      observe: 'response',
    });
  }

  postDataForBase64(endpoint: string, body: {}): Observable<HttpResponse<string>> {
    const url = `${this.urlBase}/${endpoint}`;
    return this.http.post(url, body, {
      responseType: 'text',
      observe: 'response',
    });
  }

  get baseUrl(): string {
    return this.urlBase;
  }

  putData<T>(
    endpoint: string,
    body: {},
    id: number
  ): Observable<HttpResponse<any>> {
    const url = `${this.urlBase}/${endpoint}/${id}`;
    return this.http.patch<any>(url, body, {
      observe: 'response',
    });
  }

  patchData<T>(endpoint: string): Observable<HttpResponse<any>> {
    const url = `${this.urlBase}/${endpoint}`;
    return this.http.patch<any>(url, {
      observe: 'response',
    });
  }

  deleteData<T>(
    endpoint: string,
    body: {},
    id: number
  ): Observable<HttpResponse<any>> {
    const url = `${this.urlBase}/${endpoint}/${id}`;
    return this.http.patch<any>(url, body, {
      observe: 'response',
    });
  }

  getBlobData(endpoint: string): Observable<Blob> {
    const url = `${this.urlBase}/${endpoint}`;
    return this.http.get(url, {
      responseType: 'blob',
    });
  }

  postBlobData<T>(endpoint: string, body: {}): Observable<Blob> {
    const url = `${this.urlBase}/${endpoint}`;
    return this.http.post(url, body, {
      responseType: 'blob',
    });
  }

//   downloadCSV(): Observable<Blob> {
//     const url = ${this.urlBase}/ws/export/csv;
//     return this.http.get(url, { responseType: 'blob' });
//   }
}