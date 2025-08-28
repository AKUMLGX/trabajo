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
  const loadAnimationService = inject(LoadAnimationService);
  
  // Solo mostrar loader para peticiones críticas, no para todas
  const skipLoader = request.headers.has('X-Skip-Loader') || 
                    request.url.includes('listar_archivos') ||
                    request.url.includes('get_atencion_por_administracion');
  
  if (!skipLoader) {
    loadAnimationService.show();
  }
  
  return next(request).pipe(finalize(() => {
    if (!skipLoader) {
      loadAnimationService.hide();
    }
  }));
};
