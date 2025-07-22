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
import { Oauth2Service } from '../services/ouath2.service';

export const errorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const matDialog = inject(MatDialog);
  const oauthService = inject(Oauth2Service);
  return next(request).pipe(
    catchError((err) => {
      // No mostrar modal de error para peticiones de verificación de archivos (404 esperado)
      const isFileCheckRequest = request.headers.has('X-Skip-Error-Handler') || 
                                request.url.includes('listar_archivos_atencion');
      
      if (err.status !== 401) {
        // Solo mostrar modal si no es una petición de verificación de archivos o si no es un 404
        if (!isFileCheckRequest || (isFileCheckRequest && err.status !== 404)) {
        matDialog.open(ErrorDialogComponent, {
          data: {
            errorTittle: 'Ha ocurrido un error',
            errorDescription: err.message,
          },
        });
        }
      }else{
        return oauthService.refeshToken().pipe(switchMap((data) => {
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
        }))
      }
      return throwError(() => new Error(err.statusText));
    })
  );
};
