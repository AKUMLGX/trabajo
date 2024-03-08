
import { Component, Input, NgModule, OnInit, TemplateRef } from '@angular/core';
import { TrafficLightsAtencionComponent } from '../traffic-lights-atencion.component';
import { FormsModule, Validators } from '@angular/forms';
import { FormBuilder, FormGroup,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatTable } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { ModalService } from '../../../../../../shared/services/modal.service';


interface Datos {
  oficio: number;
  turno_Jefatura: number;
  folio_interno: string;
  folio_scanner: string;
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
  selector: 'app-reaply',
  standalone: true,
  imports: [
    TrafficLightsAtencionComponent,
    FormsModule,
    ReactiveFormsModule,
    MatTable,
    MatDialogModule,
    CommonModule,
    MatIcon
  ],
  templateUrl: './reaply.component.html',
  styleUrl: './reaply.component.css'
})

export class ReaplyComponent implements OnInit {
  @Input() datosFolio!: Datos;





  constructor(private fb: FormBuilder,private modalService:ModalService) { }
  ngOnInit(): void {
    this.reaplyForm.controls['foliointerno'].setValue(this.datosFolio.folio_interno)
  }



  public reaplyForm: FormGroup = this.fb.group({
    oficio: [null, [Validators.required]],
    fechaAtencion: [null, [Validators.required]],
    atencion: [{ value: "Respuesta", disabled: true }],
    documentoescaneado: [null,[Validators.required] ],
    descripcion: [null,[Validators.required]],
    tiporespuesta: [null,[Validators.required]],
    folioscanner: [null,[Validators.required]],
    foliointerno: [null,[Validators.required ],]
  })

  sendReaply():void{
    console.log(this.reaplyForm.value);
  }

  openModalWithTemplate(template:TemplateRef<any>){



  }
}
