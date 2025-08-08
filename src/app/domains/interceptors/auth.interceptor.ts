import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const sessionInfo = localStorage.getItem('sessionInfo');
  if (sessionInfo !== null) {
    const parse = JSON.parse(sessionInfo);
    const token = parse.token;
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: token,
        },
      });
    }
  }
  return next(request).pipe(catchError((err: HttpErrorResponse) => {
    return throwError(() => new Error('Exception'));
  }));
};


