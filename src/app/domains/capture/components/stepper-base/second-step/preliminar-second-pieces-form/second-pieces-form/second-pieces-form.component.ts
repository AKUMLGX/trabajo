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
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatCheckboxModule,
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

  dropdownChoice = this.collectSecondPiecesInfoService.TIPOASUNTO;

  public secondPiecesForm: FormGroup = this.fb.group({
    administracion: [{value: 'a_5_e.g.', disabled: true}],
    fechaRecepcion: [null, [Validators.required]],
    documentoEscaneado: ['', [Validators.required, Validators.maxLength(255)]],
    documento: [{value: 'Requerimiento_e.g.', disabled: true},],
    descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
    atencion: [{value: 'Recibido_e.g.', disabled: true},],
    autoridadRemitente: ['', [Validators.required, Validators.maxLength(255)]],
    turnoJefatura: [null, [Validators.maxLength(255)]],
    personaRelacionada: [{value: 'persona_relacionada_e.g.', disabled: true}],
    tipoAsunto: [{value: 'concurso_mercantil_e.g.', disabled: true},],
    plazoAtencionHoras: [null, [Validators.min(1)]],
    plazoAtencionDias: [null, [Validators.min(0)]],
    plazoAtencionUrgente: [null],
      
    folioJupiter: [null, [Validators.maxLength(255)]],
    volanteJefatura: [null, [Validators.maxLength(255)]],

  });

  saveSecondPiecesForm(): void {
    console.log(this.secondPiecesForm.value);
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  openCustomModalWithTemplate(template: TemplateRef<any>){
    this.collectSecondPiecesInfoService.updateSecondPiecesForm(
      'a_5_e.g.',
      this.secondPiecesForm.value.fechaRecepcion,
      this.secondPiecesForm.value.documentoEscaneado,
      'Requerimiento_e.g.',
      this.secondPiecesForm.value.descripcion,
      'Recibido_e.g.',
      this.secondPiecesForm.value.autoridadRemitente,
      this.secondPiecesForm.value.turnoJefatura,
      'persona_relacionada_e.g.',
      'concurso_mercantil_e.g.',
      this.secondPiecesForm.value.volanteJefatura,
      this.secondPiecesForm.value.folioJupiter,
    );

    this.collectSecondPiecesInfoService.updatePlazoDeAtencion(
      this.secondPiecesForm.value.plazoAtencionHoras,
      this.secondPiecesForm.value.plazoAtencionDias,
      this.secondPiecesForm.value.plazoAtencionUrgente,
    );

    this.modalService.openCustomDialogWithTemplate({
      template
    })
  }
  
}
