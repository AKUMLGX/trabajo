import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  let sessionInfo = localStorage.getItem('sessionInfo');
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
  return next(request);
};
