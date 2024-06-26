import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { Oauth2Service } from '../services/ouath2.service';
import { LogoutService } from '../services/logout.service';
import { ModalData } from '../shared/models/modal-data.model';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../components/error-dialog/error-dialog.component';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  let sessionInfo = localStorage.getItem('sessionInfo');
  let oauthService = inject(Oauth2Service);
  let logoutService = inject(LogoutService);
  let matDialog = inject(MatDialog);
  if (sessionInfo !== null) {
    let parse = JSON.parse(sessionInfo);
    let token = parse.token;
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: token,
        },
      });
    }
  }
  return next(request).pipe(catchError((err: HttpErrorResponse) => {
    if (err.message === "Unauthorized") {
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
    matDialog.open(ErrorDialogComponent, {
      disableClose: true,
      data: {
        errorTittle: 'Sesión inválida',
        errorDescription: 'El tiempo de sesión ha expirado, favor de volver a iniciar sesión.',
        func: 'logout'
      },
    });
    return throwError(() => new Error('Unauthorized Exception'));
  }));
};


