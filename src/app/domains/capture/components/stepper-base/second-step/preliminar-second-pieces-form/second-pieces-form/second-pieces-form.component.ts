import { Component, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../../../../shared/services/modal.service';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CollectSecondPiecesInfoService } from '../../../../../../shared/services/collect-second-pieces-info.service';
import { SecondPiecesInfoTableComponent } from './second-pieces-info-table/second-pieces-info-table.component';

@Component({
  selector: 'app-second-pieces-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule, 
    MatStepperModule,
    MatTableModule,
    MatDialogModule,
    CommonModule,
    MatIconModule,
    SecondPiecesInfoTableComponent,
  ],
  templateUrl: './second-pieces-form.component.html',
  styleUrl: './second-pieces-form.component.css'
})
export class SecondPiecesFormComponent {

  isSecondPiece: boolean = true;

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private collectSecondPiecesInfoService: CollectSecondPiecesInfoService,
  ){}

  public secondPiecesForm: FormGroup = this.fb.group({
    administracion: [{value: 'a_3', disabled: true},], 
              //este campo se debe traer desde el back 
    fechaRecepcion: [null, [Validators.required]],
    documentoEscaneado: ['', [Validators.required, Validators.maxLength(255)]],
    atencion: [{value: 'Requerimiento', disabled: true},],
    descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
    tipoRespuesta: [{value: 'En trámite', disabled: true},],
    autoridadSolicitante: ['', [Validators.required, Validators.maxLength(255)]],
    carpetaInvestigacion: [null, [Validators.maxLength(255)]],
    personaRelacionada: [{value: 'persona relacionada', disabled: true},], 
            //este campo se debe traer desde el back
    tipoAsunto: [{value: 'EUACAPE', disabled: true},],
    plazoAtencion: [null, [Validators.min(1)]],
  });

  saveSecondPiecesForm(): void {
    console.log(this.secondPiecesForm.value);
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  openCustomModalWithTemplate(template: TemplateRef<any>){
    this.collectSecondPiecesInfoService.updateEuacapeForm(
      this.isSecondPiece ? 'a_3' : this.secondPiecesForm.value.administracion, 
                //este dato se va a traer desde el back
      this.secondPiecesForm.value.fechaRecepcion,
      this.secondPiecesForm.value.documentoEscaneado,
      this.isSecondPiece ? 'Requerimiento' : this.secondPiecesForm.value.atencion,
      this.secondPiecesForm.value.descripcion,
      this.isSecondPiece ? 'En trámite' : this.secondPiecesForm.value.tipoRespuesta,
      this.secondPiecesForm.value.autoridadSolicitante,
      this.secondPiecesForm.value.carpetaInvestigacion,
      this.isSecondPiece ? 'Nombre de la persona' : this.secondPiecesForm.value.personaRelacionada,
                //este dato se va a traer desde el back
      this.secondPiecesForm.value.plazoAtencion,
    );
    this.modalService.openCustomDialogWithTemplate({
      template
    })
  }
  
}
