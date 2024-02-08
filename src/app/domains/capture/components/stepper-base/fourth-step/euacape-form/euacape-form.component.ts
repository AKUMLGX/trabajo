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

export interface EuacapeTableBeforeSubmit {
  name: string;
  position: number;
  answer: string | null;
}

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
  ],
  templateUrl: './euacape-form.component.html',
  styleUrl: './euacape-form.component.css'
})
export class EuacapeFormComponent {

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
  ) {

  }

  @Input({required: true}) isEuacapeSecondPartEnabled!: boolean;

  
  OFICIO = '';

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
    console.log(this.OFICIO);
    alert(`Input field value ${this.OFICIO}`);
  }

  saveSecondEuacapeForm(): void {
    console.log(this.secondEuacapeForm.value);
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

  ELEMENT_DATA: EuacapeTableBeforeSubmit[] = [
    {position: 1, name: 'Oficio', answer: this.OFICIO},
    {position: 2, name: 'Administración', answer: ''},
    {position: 3, name: 'Fecha de recepción', answer: ''},
    {position: 4, name: 'Documentos escaneados', answer: ''},
    {position: 5, name: 'Atención', answer: ''},
    {position: 6, name: 'Descripción', answer: ''},
    {position: 7, name: 'Tipo de respuesta', answer: ''},
    {position: 8, name: 'Autoridad solicitante', answer: ''},
    {position: 9, name: 'Turno jefatura', answer: ''},
    {position: 10, name: 'Respuesta', answer: ''},
    {position: 11, name: ' Acuse', answer: ''},
    {position: 12, name: 'Folio interno', answer: ''},
    {position: 13, name: 'Carpeta de investigación', answer: ''},
    {position: 14, name: 'Persona relacionada', answer: ''},
    {position: 15, name: 'Folio scanner', answer: ''},
    {position: 16, name: 'Tipo asunto', answer: ''},
    {position: 17, name: 'Plazo de atención', answer: ''},
  ];

  displayedColumns: string[] = ['demo-position', 'demo-name', 'demo-answer'];
  dataSource = this.ELEMENT_DATA;

}
