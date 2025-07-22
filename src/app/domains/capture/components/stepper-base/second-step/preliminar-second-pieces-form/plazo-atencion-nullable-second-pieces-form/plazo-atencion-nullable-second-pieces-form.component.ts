import { Component, TemplateRef } from '@angular/core';
import { ModalService } from '../../../../../../shared/services/modal.service';
import { 
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CollectSecondPiecesInfoService } from '../../../../../../shared/services/collect-second-pieces-info.service';
import { SecondPiecesInfoTableComponent } from '../second-pieces-form/second-pieces-info-table/second-pieces-info-table.component';
import { SearchStatusService } from '../../../../../../shared/services/search-status.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-plazo-atencion-nullable-second-pieces-form',
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
  templateUrl: './plazo-atencion-nullable-second-pieces-form.component.html',
  styleUrl: './plazo-atencion-nullable-second-pieces-form.component.css'
})
export class PlazoAtencionNullableSecondPiecesFormComponent {

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private collectSecondPiecesInfoService: CollectSecondPiecesInfoService,
    private searchStatusService: SearchStatusService,
  ){

  }

  isSecondPiece = true;

  documentoEscaneadoName = '';
  documentoEscaneadoFile?:File;

  preloadedAdministracion = this.searchStatusService.administracionFromSelectedRow;
  preloadedPersonaRelacionada = this.searchStatusService.personaRelacionadaFromSelectedRow;
  preloadedTipoAsunto = this.searchStatusService.tipoAsuntoFromSelectedRow;

  
  public plazoAtencionNullableSecondPiecesForm: FormGroup = this.fb.group({
    fechaRecepcion: [null, [Validators.required]],
    documentoEscaneadoField:[null, [Validators.required]],

    documento: [null, [Validators.required]],

    descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
    atencion: [null, [Validators.required]],
    autoridadRemitente: ['', [Validators.required, Validators.maxLength(255)]],
    turnoJefatura: [null, [Validators.maxLength(255)]],
    tipoAsunto: [null, [Validators.required]],
    plazoAtencionHoras: [null, [Validators.min(1)]],
    plazoAtencionDias: [null, [Validators.min(0)]],
    plazoAtencionUrgente: [false],

    folioJupiter: [null, [Validators.maxLength(255)]],
    volanteJefatura: [null, [Validators.maxLength(255)]],

  });  

  savePlazoAtencionNullableSecondPiecesForm(): void {
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0]
    this.documentoEscaneadoFile = file;
    if (this.documentoEscaneadoFile) {
      this.documentoEscaneadoName = this.documentoEscaneadoFile.name.toString().replaceAll(' ','_')
    }
  }

  openCustomModalWithTemplate(template: TemplateRef<any>){
    this.collectSecondPiecesInfoService.updateSecondPiecesForm(
      this.preloadedAdministracion(),
      this.plazoAtencionNullableSecondPiecesForm.value.fechaRecepcion,
      //this.secondPiecesForm.value.documentoEscaneado,
      this.documentoEscaneadoName,
      this.documentoEscaneadoFile,
      this.plazoAtencionNullableSecondPiecesForm.value.documento,
      this.plazoAtencionNullableSecondPiecesForm.value.descripcion,
      this.plazoAtencionNullableSecondPiecesForm.value.atencion,
      this.plazoAtencionNullableSecondPiecesForm.value.autoridadRemitente,
      this.plazoAtencionNullableSecondPiecesForm.value.turnoJefatura,
      this.preloadedPersonaRelacionada(),
      this.plazoAtencionNullableSecondPiecesForm.value.tipoAsunto,
      this.plazoAtencionNullableSecondPiecesForm.value.volanteJefatura,
      this.plazoAtencionNullableSecondPiecesForm.value.folioJupiter,
    );

    if(this.plazoAtencionNullableSecondPiecesForm.value.plazoAtencionUrgente) {
      this.collectSecondPiecesInfoService.updatePlazoDeAtencionIfCheck();
    }
    
    if(
      this.plazoAtencionNullableSecondPiecesForm.value.plazoAtencionUrgente === false ||
      this.plazoAtencionNullableSecondPiecesForm.value.plazoAtencionUrgente === undefined
    ) {
      this.collectSecondPiecesInfoService.updatePlazoDeAtencion(
        this.plazoAtencionNullableSecondPiecesForm.value.plazoAtencionHoras,
        this.plazoAtencionNullableSecondPiecesForm.value.plazoAtencionDias,
        this.plazoAtencionNullableSecondPiecesForm.value.plazoAtencionUrgente,
      );
    }


    this.modalService.openCustomDialogWithTemplate({
      template
    })
  }

}
