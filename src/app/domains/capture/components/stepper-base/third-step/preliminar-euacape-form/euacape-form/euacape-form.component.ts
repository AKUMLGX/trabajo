import { Component, Input, TemplateRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../../../../shared/services/modal.service';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import {MatTableModule} from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { InfoTableComponent } from './info-table/info-table.component';

@Component({
  selector: 'app-euacape-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule, 
    MatStepperModule,
    MatTableModule,
    MatDialogModule,
    CommonModule,
    InfoTableComponent
  ],
  templateUrl: './euacape-form.component.html',
  styleUrl: './euacape-form.component.css'
})
export class EuacapeFormComponent {

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    ){}

    ADMON = '';
    FECHAREC = '';
    DOCSSCAN = '';
    ATENCION = '';
    DESCRIPCION = '';
    TIPORES = '';
    AUTORIDADSOLIC = '';
    RES = '';
    ACUSE = '';
    CARPETAINV = '';
    PERSONAREL = '';
    TIPOASUNTO = '';
    PLAZOATENCION = '';

    public euacapeForm: FormGroup = this.fb.group({
      administracion: [''],
      fechaRecepcion: [''],
      documentosEscaneados: [''],
      atencion: [null],
      descripcion: [''],
      tipoRespuesta: [null],
      autoridadSolicitante: [''],
      respuesta: [null],
      acuse: [null],
      carpetaInvestigacion: [''],
      personaRelacionada: [''],
      tipoAsunto: [''],
      plazoAtencion: [''],
    });

    saveEuacapeForm(): void {
      console.log(this.euacapeForm.value);
      //this.OFICIO = this.secondEuacapeForm.value
      //this.OFICIO = this.euacapeForm.value.administracion;
      //console.log(this.OFICIO);
      this.ADMON = this.euacapeForm.value.administracion;
      this.FECHAREC = this.euacapeForm.value.fechaRecepcion;
      this.DOCSSCAN = this.euacapeForm.value.documentosEscaneados;
      this.ATENCION = this.euacapeForm.value.atencion;
      this.DESCRIPCION = this.euacapeForm.value.descripcion;
      this.TIPORES = this.euacapeForm.value.tipoRespuesta;
      this.AUTORIDADSOLIC = this.euacapeForm.value.autoridadSolicitante;
      this.RES = this.euacapeForm.value.respuesta;
      this.ACUSE = this.euacapeForm.value.acuse;
      this.CARPETAINV = this.euacapeForm.value.carpetaInvestigacion;
      this.PERSONAREL = this.euacapeForm.value.personaRelacionada;
      this.TIPOASUNTO = this.euacapeForm.value.tipoAsunto;
      this.PLAZOATENCION = this.euacapeForm.value.plazoAtencion;
    }
  
    openCustomModal() {
      this.modalService.openCustomDialog({
        title: 'Title for cutom dialog',
        content: 'Allo le monde, vous pouvez voir le contenu ici, une fois de plus!',
      });
    }
  
    openCustomModalWithTemplate(template: TemplateRef<any>){
      this.modalService.openCustomDialogWithTemplate({
        template
      })
    }

}
