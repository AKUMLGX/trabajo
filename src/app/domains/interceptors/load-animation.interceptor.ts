import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { LoadAnimationService } from '../services/load-animation.service';

export const loadAnimationInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const loadAnimationService = inject(LoadAnimationService);

  console.log('INTERCEPTOR LOADER:', request.url);

  const skipLoader =
    request.headers.has('X-Skip-Loader') ||
    request.url.includes('listar_archivos') ||
    request.url.includes('get_atencion_por_administracion') ||
    request.url.includes('por-oficio') ||
    request.url.includes('validar-oficio');

  if (!skipLoader) {
    loadAnimationService.show();
  }

  return next(request).pipe(
    finalize(() => {
      if (!skipLoader) {
        loadAnimationService.hide();
      }
    })
  );
};
