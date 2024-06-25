import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { LogoutService } from '../services/logout.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  console.log(request.url);
  let sessionInfo = localStorage.getItem('sessionInfo');
  if (sessionInfo !== null) {
    let parse = JSON.parse(sessionInfo);
    let expiryDate = new Date(parse.exp * 1000);
    let currentDate = new Date(Date.now());
    if (expiryDate < currentDate && request.url != environment.baseUrl + environment.tokenValidationEndpoint) {
      let logoutService = inject(LogoutService);
      logoutService.logout();
    }
    let token = parse.token;
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: token,
        },
      });
    }
  }
  return next(request).pipe(catchError(err => {
    if (err.status === 401) {
      let logoutService = inject(LogoutService);
      logoutService.logout();
    }
    return throwError(() => new Error(err.statusText));
  }));
};


