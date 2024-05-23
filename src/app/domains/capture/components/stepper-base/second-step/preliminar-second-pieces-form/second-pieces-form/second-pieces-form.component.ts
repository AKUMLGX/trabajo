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

  public secondPiecesForm: FormGroup = this.fb.group({
    administracion: [null, [Validators.required]],
    fechaRecepcion: [null, [Validators.required]],
    documentoEscaneado: ['', [Validators.required, Validators.maxLength(255)]],
    
    documento: [null, [Validators.required]],  

    descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
    atencion: [{value: 'Recibido', disabled: true},],
    autoridadRemitente: ['', [Validators.required, Validators.maxLength(255)]],
    turnoJefatura: [null, [Validators.maxLength(255)]],
    personaRelacionada: ['', [Validators.required, Validators.maxLength(255)]],
    tipoAsunto: [null, [Validators.required]],
    plazoAtencionHoras: [{ value: null,}, [Validators.min(1)]],
    plazoAtencionDias: [{ value: null, }, [Validators.min(0)]],
    plazoAtencionUrgente: [false],
      
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
      this.secondPiecesForm.value.administracion,
      this.secondPiecesForm.value.fechaRecepcion,
      this.secondPiecesForm.value.documentoEscaneado,
      this.secondPiecesForm.value.documento,
      this.secondPiecesForm.value.descripcion,
      'Recibido',
      this.secondPiecesForm.value.autoridadRemitente,
      this.secondPiecesForm.value.turnoJefatura,
      this.secondPiecesForm.value.personaRelacionada,
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
