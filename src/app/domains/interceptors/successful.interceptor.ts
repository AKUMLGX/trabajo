import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import {MatDialog } from '@angular/material/dialog';
import { SuccessfulDialogComponent } from '../components/successful-dialog/successful-dialog.component';

export const successfullInterceptor: HttpInterceptorFn=(
  request:HttpRequest<any>,
  next:HttpHandlerFn
): Observable<HttpEvent<unknown>> =>{
   let matDialog_ = inject(MatDialog)
   return next(request).pipe(
    catchError((suf)=>{
      if (suf.status === 200 ) {
        matDialog_.open(SuccessfulDialogComponent,{
          data:{
            msjTitle:"Exito",
            msjDescription:suf.message
          }
        })
      }
      return throwError(()=>new Error(suf.statusText))
    })
   )
}
