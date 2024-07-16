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
  let matDialog = inject(MatDialog);
  let oauthService = inject(Oauth2Service);
  return next(request).pipe(
    catchError((err) => {
      if (err.status !== 401) {
        matDialog.open(ErrorDialogComponent, {
          data: {
            errorTittle: 'Ha ocurrido un error',
            errorDescription: err.message,
          },
        });
      }else{
        return oauthService.refeshToken().pipe(switchMap((data) => {
          let sessionInfo = localStorage.getItem('sessionInfo');
          if (sessionInfo !== null) {
            let parse = JSON.parse(sessionInfo);
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
