import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
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
      
      // No mostrar modal para endpoints de Tlalcalli que aún no están implementados
      const isTlalcalliEndpoint = request.url.includes('expedientes/buscar') || 
                                     request.url.includes('tlalcalli/api/v1');
      const isTlalcalli404 = isTlalcalliEndpoint && err.status === 404;
      
      // No mostrar modal para errores 409 (conflictos) - el componente los manejará
      const is409Conflict = err.status === 409;
      
      // No mostrar modal para POST/PUT de expedientes - el componente maneja los errores
      const isExpedienteRequest = request.url.includes('expedientes') && 
                                   (request.method === 'POST' || request.method === 'PUT');
      
      if (err.status !== 401) {
        // Solo mostrar modal si no es una petición especial
        const shouldShowModal = !isFileCheckRequest && 
                                !isTlalcalli404 && 
                                !is409Conflict &&
                                !isExpedienteRequest &&
                                !(isFileCheckRequest && err.status === 404);
        
        if (shouldShowModal) {
          // Extraer mensaje de error del backend si existe
          const errorMsg = err.error?.message || err.error?.error || err.message || 'Error desconocido';
          
          matDialog.open(ErrorDialogComponent, {
            data: {
              errorTittle: 'Ha ocurrido un error',
              errorDescription: errorMsg,
            },
          });
        } else if (isTlalcalli404) {
          console.warn('⚠️ [HTTP Interceptor] Endpoint Tlalcalli no disponible:', request.url);
        } else if (is409Conflict) {
          console.warn('⚠️ [HTTP Interceptor] Conflicto 409 - Será manejado por el componente');
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
