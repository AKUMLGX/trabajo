import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { LoadAnimationService } from '../services/load-animation.service';

export const loadAnimationInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  console.log("Se está haciendo una petición " + request.url);
  let loadAnimationInterceptor = inject(LoadAnimationService);
  loadAnimationInterceptor.show();
  return next(request).pipe(finalize(() => {
    loadAnimationInterceptor.hide();
    }));
};
