import {
  HttpClient,
  HttpErrorResponse,
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
  let sessionInfo = localStorage.getItem('sessionInfo');
  let httpClient = inject(HttpClient);
  let logoutService = inject(LogoutService);
  if (sessionInfo !== null) {
    let parse = JSON.parse(sessionInfo);
    let expiryDate = new Date(parse.exp * 1000);
    let currentDate = new Date(Date.now());
    if (expiryDate < currentDate && request.url != environment.baseUrl + environment.tokenValidationEndpoint) {
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
  return next(request).pipe(catchError((err: HttpErrorResponse) => {
    if (err.message == "Unauthorized") {
      httpClient
      .get(
        environment.baseUrl + environment.refreshTokenEndpoint, {withCredentials: true, responseType: "text"}
      )
      .subscribe({
        next: (data) => {
         let sessionInfo = localStorage.getItem('sessionInfo');
         if (sessionInfo !== null) {
           let parse = JSON.parse(sessionInfo);
           parse.token = data;
           console.log("El nuevo token " + parse.token);
           localStorage.setItem('sessionInfo', JSON.stringify(parse));
         }
        },
        error: (err) => {
          logoutService.logout();
        },
      });
    }
    return throwError(() => new Error(err.statusText));
  }));
};


