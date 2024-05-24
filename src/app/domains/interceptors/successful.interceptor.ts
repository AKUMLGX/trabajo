import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, map, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SuccessfulDialogComponent } from '../components/successful-dialog/successful-dialog.component';

export const successfullInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  let matDialog_ = inject(MatDialog)
  return next(request).pipe(
    map((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        if (event.status === 200) {
          matDialog_.open(SuccessfulDialogComponent, {
            data: {
              msjTitle: "Exito",
              msjDescription: "Ehshsh"
            }
          })
        }
      }
      return event;
    })
  )
}

