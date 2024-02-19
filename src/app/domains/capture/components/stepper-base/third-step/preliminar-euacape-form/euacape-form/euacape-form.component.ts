import { Component, Input, Signal, TemplateRef, signal } from '@angular/core';
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

    isApertura: boolean = true; //este campo debe venir en un futuro desde la search bar

    ADMON = '';
    FECHAREC = null;
    DOCSCAN = '';
    ATENCION = '';
    DESCRIPCION = '';
    TIPORES = '';
    AUTORIDADSOLIC = '';
    CARPETAINV = null;
    PERSONAREL = '';
    PLAZOATENCION = null;

    public euacapeForm: FormGroup = this.fb.group({
      administracion: [null, [Validators.required]],
      fechaRecepcion: [null, [Validators.required]],
      documentoEscaneado: ['', [Validators.required, Validators.maxLength(255)]],
      atencion: [null],
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
      tipoRespuesta: [null],
      autoridadSolicitante: ['', [Validators.required, Validators.maxLength(255)]],
      carpetaInvestigacion: [null, [Validators.maxLength(255)]],
      personaRelacionada: ['', [Validators.required, Validators.maxLength(255)]],
      plazoAtencion: [null, [Validators.min(1)]],
    });

    saveEuacapeForm(): void {
      console.log(this.euacapeForm.value);
      //this.OFICIO = this.secondEuacapeForm.value
      //this.OFICIO = this.euacapeForm.value.administracion;
      //console.log(this.OFICIO);
      this.ADMON = this.euacapeForm.value.administracion;
      this.FECHAREC = this.euacapeForm.value.fechaRecepcion;
      this.DOCSCAN = this.euacapeForm.value.documentoEscaneado;
      this.ATENCION = this.isApertura ? 'Requerimiento' : this.euacapeForm.value.atencion;
      this.DESCRIPCION = this.euacapeForm.value.descripcion;
      this.TIPORES = this.isApertura ? 'En trámite' : this.euacapeForm.value.tipoRespuesta;
      this.AUTORIDADSOLIC = this.euacapeForm.value.autoridadSolicitante;
      this.CARPETAINV = this.euacapeForm.value.carpetaInvestigacion;
      this.PERSONAREL = this.euacapeForm.value.personaRelacionada;
      this.PLAZOATENCION = this.euacapeForm.value.plazoAtencion;
    }
  
    //openCustomModal() {
    //  this.modalService.openCustomDialog({
    //     title: 'Title for cutom dialog',
    //     content: 'Allo le monde, vous pouvez voir le contenu ici, une fois de plus!',
    //   });
    // }
  
    openCustomModalWithTemplate(template: TemplateRef<any>){
      this.modalService.openCustomDialogWithTemplate({
        template
      })
    }
}
