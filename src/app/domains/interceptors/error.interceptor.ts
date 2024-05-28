import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../components/error-dialog/error-dialog.component';

export const errorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  let matDialog = inject(MatDialog);
  return next(request).pipe(
    catchError((err) => {
      if (err.status !== 401) {
        matDialog.open(ErrorDialogComponent, {
          data: {
            errorTittle: 'Ha ocurrido un error',
            errorDescription: err.message,
          },
        });
      }
      return throwError(() => new Error(err.statusText));
    })
  );
};
