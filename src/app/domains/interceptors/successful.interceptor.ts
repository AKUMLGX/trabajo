import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SuccessfulDialogComponent } from '../components/successful-dialog/successful-dialog.component';
import { environment } from '../../../environments/environment';
import { LoginDialogComponent } from '../components/login-dialog/login-dialog.component';


export const successfullInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  let matDialog_ = inject(MatDialog)
  return next(request).pipe(
    map((event: HttpEvent<any>) => {
      if (request.url === environment.baseUrl + environment.tokenValidationEndpoint) {
        if (event instanceof HttpResponse) {
          if (event.status === 200) {
            matDialog_.open(LoginDialogComponent, {
              disableClose:true,
              data: {
                msjTitle: "Exito",
                msjDescription: "Login Exitoso"
              }
            })
          }
        }
      }else{
        if (request.method !== "GET" && !request.url.includes("get_estadisticas_atencion")) {
          if (event instanceof HttpResponse) {
            if (event.status === 200) {
              matDialog_.open(SuccessfulDialogComponent, {
                disableClose:true,
                data: {
                  msjTitle: "Exito",
                  msjDescription: "Acción realizada con exito"
                }
              })
            }
          }
        }
      }
      return event;
    })
  )
}
