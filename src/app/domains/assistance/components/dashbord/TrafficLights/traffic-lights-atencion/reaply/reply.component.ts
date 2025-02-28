
import { Component, Input, NgModule, OnInit, TemplateRef } from '@angular/core';
import { TrafficLightsAtencionComponent } from '../traffic-lights-atencion.component';
import { FormsModule, Validators } from '@angular/forms';
import { FormBuilder, FormGroup,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTable } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { ModalService } from '../../../../../../shared/services/modal.service';
import { CollectformReplyInfoService } from '../../../../../../shared/services/collect-form-reply-info.service';
import {  InfotableReplyComponent } from './info-table/info-table-reply.component';



interface Datos {
  oficio: number;
  turno_Jefatura: number;
  folio_interno: string;
  folio_scanner: number;
  administracion: string;
  documento_escaneado: string;
  descripcion: string;
  autoridad_solicitante: string;
  persona_relacionada: string;
  plazo_atencion: number;
  fecha_recepcion: string;
  atencion: string;
  tipo_repusta: string;
  caprte_investigacion: string;
  tipo_asunto: string;
}


@Component({
  selector: 'app-reply',
  standalone: true,
  imports: [
    TrafficLightsAtencionComponent,
    FormsModule,
    ReactiveFormsModule,
    MatTable,
    MatDialogModule,
    CommonModule,
    MatIcon,
    InfotableReplyComponent
  ],
  templateUrl: './reply.component.html',
  styleUrl: './reply.component.css'
})

export class ReaplyComponent implements OnInit {
  @Input() datosFolio!: Datos;

  constructor(private fb: FormBuilder,private modalService:ModalService,
    private collectFormReplyInfo: CollectformReplyInfoService
  ) { }
  ngOnInit(): void {
    this.replyForm.controls['foliointerno'].setValue(this.datosFolio.folio_interno)

  }

  public replyForm: FormGroup = this.fb.group({
    oficio: [null, [Validators.required]],
    fechaAtencion: [null, [Validators.required]],
    atencion: [{ value: "Respuesta", disabled: true }],
    documentoescaneado: [null,[Validators.required] ],
    descripcion: [null,[Validators.required]],
    tiporespuesta: [null,[Validators.required]],
    folioscanner: [null,[Validators.required]],
    foliointerno: [null,[Validators.required ],]
  })


  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  sendReaply():void{
  }

  openModalWithTemplate(template:TemplateRef<any>){
    this.collectFormReplyInfo.updateReplyFrom(
      this.replyForm.value.oficio,
      this.replyForm.value.fechaAtencion,
      this.replyForm.value.documentoescaneado,
       //this.reaplyForm.value.atencion,
      this.replyForm.value.descripcion,
      this.replyForm.value.tiporespuesta,
      this.replyForm.value.folioscanner,
      this.replyForm.value.foliointerno,
    )
this.modalService.openCustomDialogWithTemplate({
  template
})
  }
}
