import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../components/error-dialog/error-dialog.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const matDialog = inject(MatDialog);
  const httpClient = inject(HttpClient);
  
  return next(request).pipe(
    catchError((err) => {
      // No mostrar modal de error para peticiones de verificación de archivos (404 esperado)
      const isFileCheckRequest = request.headers.has('X-Skip-Error-Handler') || 
                                request.url.includes('listar_archivos');
      
      // No mostrar modal para endpoints de Tlapohualli que aún no están implementados
      const isTlapohualliEndpoint = request.url.includes('expedientes/buscar') || 
                                     request.url.includes('tlapohualli/api/v1');
      const isTlapohualli404 = isTlapohualliEndpoint && err.status === 404;
      
      if (err.status !== 401) {
        // Solo mostrar modal si no es una petición especial o endpoint de Tlapohualli no implementado
        if (!isFileCheckRequest && !isTlapohualli404 && !(isFileCheckRequest && err.status === 404)) {
          matDialog.open(ErrorDialogComponent, {
            data: {
              errorTittle: 'Ha ocurrido un error',
              errorDescription: err.message,
            },
          });
        } else if (isTlapohualli404) {
          console.warn('⚠️ [HTTP Interceptor] Endpoint Tlapohualli no disponible:', request.url);
        }
      } else {
        // Para el error 401, intentar refresh token usando HttpClient directamente
        return httpClient
          .get(environment.baseUrl + environment.refreshTokenEndpoint, { 
            withCredentials: true, 
            responseType: "text" 
          })
          .pipe(
            switchMap((data) => {
              const sessionInfo = localStorage.getItem('sessionInfo');
          if (sessionInfo !== null) {
                const parse = JSON.parse(sessionInfo);
            parse.token = data;
            localStorage.setItem('sessionInfo', JSON.stringify(parse));
          }
          return next(request.clone({
            setHeaders: {
              Authorization: data,
            },
          }));
            }),
            catchError((refreshError) => {
              // Si el refresh token falla, redirigir al login
              localStorage.removeItem('sessionInfo');
              window.location.href = '/login';
              return throwError(() => new Error('Session expired'));
            })
          );
      }
      return throwError(() => new Error(err.statusText));
    })
  );
};
