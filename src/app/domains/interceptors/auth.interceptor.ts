import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { LogoutService } from '../services/logout.service';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  
  let sessionInfo = localStorage.getItem('sessionInfo');
  if (sessionInfo !== null) {
    let parse = JSON.parse(sessionInfo);
    let expiryDate = new Date(parse.exp * 1000);
    let currentDate = new Date(Date.now());
    if (expiryDate < currentDate) {
      let logoutService = inject(LogoutService);
      //logoutService.logout();
    }
    let token = parse.token;
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: "Bearer " + token,
        },
      });
    }
  }
  return next(request).pipe(catchError(err => {
    console.log("Se obtiene un error " + err.statusText);
    if (err.status === 401) {
    console.log("Token invalido");
     // remove Bearer token and redirect to login page
     // this.router.navigate(['/auth/login']);
    }
    return throwError(() => new Error(err.statusText));
  }));
};


