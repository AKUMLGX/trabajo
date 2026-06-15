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
import { MatSnackBar } from '@angular/material/snack-bar';


export const successfullInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const matDialog_ = inject(MatDialog)
  const _snackBar = inject(MatSnackBar)
  return next(request).pipe(
    map((event: HttpEvent<any>) => {
      if (request.url === environment.baseUrl + environment.tokenValidationEndpoint) {
        if (event instanceof HttpResponse) {
          if (event.status === 200) {
            matDialog_.open(LoginDialogComponent, {
              disableClose: true,
              data: {
                msjTitle: "Exito",
                msjDescription: "Login Exitoso"
              }
            })
          }
        }
      } else {
        if (request.method === "GET" && !request.url.includes('expedientes/siguiente')) {
          if (event instanceof HttpResponse) {
            if (event.status === 200) {
              if (event.status === 200) {
                _snackBar.open("Exito", "Cerrar", {
                  duration: 2000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom'
                })
              }
            }
          }
        } else if (request.method === 'POST' && request.url.includes('asunto/nuevo/euacape/apertura/')) {
          if (event instanceof HttpResponse) {
            if (event.status === 200) {
              matDialog_.open(SuccessfulDialogComponent, {
                disableClose: true,
                data: {
                  msjTitle: "Exito",
                  msjDescription: "Acción realizada con exito"
                }
              })
            }
          }
        } else if (request.url.includes('asunto/nuevo/euacape/segunda_pieza/')) {
          if (event instanceof HttpResponse) {
            if (event.status === 200) {
              matDialog_.open(SuccessfulDialogComponent, {
                disableClose: true,
                data: {
                  msjTitle: "Exito",
                  msjDescription: "Acción realizada con exito"
                }
              })
            }
          }
        }
        else if (request.method == "POST") {
          if (event instanceof HttpResponse) {
            if (event.status === 200) {
              _snackBar.open("Exito", "Cerrar", {
                duration: 2000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              })
            }
          }
        }
      }
      return event;
    })
  )
}
