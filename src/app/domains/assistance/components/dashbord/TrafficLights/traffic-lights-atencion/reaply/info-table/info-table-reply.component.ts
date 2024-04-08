import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { CollectformReplyInfoService } from '../../../../../../../shared/services/collect-form-reply-info.service';
import { FormReplyObjectService } from '../../../../../../../shared/services/form-reply-object.service';

export interface DataBeforeSubmit {
  name: string;
  position: number;
  answer: string | Date | number | null;
}

@Component({
  selector: 'app-info-table-reply',
  standalone: true,
  imports: [MatDialogModule, MatTableModule],
  templateUrl: './info-table-reply.component.html',
  styleUrl: './info-table-reply.component.css'
})
export class InfotableReplyComponent {

  constructor(
    private collectFormReaply: CollectformReplyInfoService,
    private formReplyObjectService:FormReplyObjectService

  ) { }


  OFICIO = this.collectFormReaply.OFICIO;
  FECHAATENCION = this.collectFormReaply.FECHAATEN
  DOCUMENTOESCANEADO = this.collectFormReaply.DOCSCAN;
 // ATENCION = this.collectFormReaply.ATENENCION;
  DESCRIPCION = this.collectFormReaply.DESCRIPCION;
  TIPORES = this.collectFormReaply.TIPORES;
  FOLIOSCANNER = this.collectFormReaply.FOLIOSCAN;
  FOLIOINTERNO = this.collectFormReaply.FOLIOINT;


  Reaply_DAta: DataBeforeSubmit[] = [

    { position: 1, name: 'Oficio', answer: this.OFICIO() },
    { position: 2, name: 'Fecha de atencion (yyyy-MM-dd)', answer: this.FECHAATENCION()},
    { position: 3, name: 'Documento escaneado', answer: this.DOCUMENTOESCANEADO() },
    { position: 4, name: 'Atención', answer: "Respuesta" },
    { position: 5, name: 'Descripción', answer: this.DESCRIPCION() },
    { position: 6, name: 'Tipo Respuesta', answer: this.TIPORES() },
    { position: 7, name: 'Folio scanner', answer: this.FOLIOSCANNER() },
    { position: 8, name: 'Folio interno', answer: this.FOLIOINTERNO() },

  ]


  confirmDataReply(
    oficio: string,
    fechaAtencion: string,
    documentoEscaneado: string,
    descripcion: string,
  //  atentencion:string,
    tipoRespuesta:string,
    folioScanner: string,
    folioInterno: string,
  )
{
 this.formReplyObjectService.replyFormObject.set({
  oficio:oficio,
  fechaAtencion:fechaAtencion,
  documento_escaneado:documentoEscaneado,
  descripcion:descripcion,
  tipoRespuesta:tipoRespuesta,
 // atencion: atentencion,
  folioScanner:folioScanner,
  folioInterno: folioInterno,
 })


 console.log("FormularioRespuesta");
 this.formReplyObjectService.replyFormObject()
}
}
