import { Component, Input, TemplateRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../../../shared/services/modal.service';
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

  OFICIO: any;

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
  ) {

  }

  @Input({required: true}) isEuacapeSecondPartEnabled!: boolean;

  public firstEuacapeForm: FormGroup = this.fb.group({
    oficio: [''],
    turnoJefatura: [''],
    folioInterno: [''],
    folioScanner: [''],
  });

  public secondEuacapeForm: FormGroup = this.fb.group({
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

  saveFirstEuacapeForm(): void{
    console.log(this.firstEuacapeForm.value);
    //this.OFICIO = this.firstEuacapeForm.value.oficio;
  }

  saveSecondEuacapeForm(): void {
    console.log(this.secondEuacapeForm.value);
    this.OFICIO = this.secondEuacapeForm.value
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
