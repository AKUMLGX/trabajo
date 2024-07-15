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

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  let sessionInfo = localStorage.getItem('sessionInfo');
  let oauthService = inject(Oauth2Service);
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
    console.log("Interceptor auth " + err.message);
    if (err.message === "Unauthorized") {
      console.log("Entra");
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
    return throwError(() => new Error('Unauthorized Exception'));
  }));
};


