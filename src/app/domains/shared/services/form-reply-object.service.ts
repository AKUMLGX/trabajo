import { Injectable, signal } from '@angular/core';
import { ReplyForm } from '../../interfaces/reply-form.interface';


@Injectable({
  providedIn: 'root'
})
export class FormReplyObjectService {

  constructor() { }

  replyFormObject=signal<ReplyForm>({
    oficio: '',
    fechaAtencion:'',
    descripcion:'',
    //atencion:'',
     tipoRespuesta:'',
    documento_escaneado:'',
    folioScanner:0,
    folioInterno:'',
  })

}
