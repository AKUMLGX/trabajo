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
import { SearchStatusService } from '../../../../../../shared/services/search-status.service';
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

  documentoEscaneadoName: string = '';
  documentoEscaneadoFile?:File;

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private collectSecondPiecesInfoService: CollectSecondPiecesInfoService,
    private searchStatusService: SearchStatusService,
  ){}

  preloadedAdministracion = this.searchStatusService.administracionFromSelectedRow;
  preloadedPersonaRelacionada = this.searchStatusService.personaRelacionadaFromSelectedRow;
  preloadedTipoAsunto = this.searchStatusService.tipoAsuntoFromSelectedRow;


  public secondPiecesForm: FormGroup = this.fb.group({
    fechaRecepcion: [null, [Validators.required]],
    documentoEscaneadoField:[null, [Validators.required]],

    documento: [null, [Validators.required]],

    descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
    atencion: [null, [Validators.required]],
    autoridadRemitente: ['', [Validators.required, Validators.maxLength(255)]],
    turnoJefatura: [null, [Validators.maxLength(255)]],
    plazoAtencionHoras: [null, [Validators.min(1)]],
    plazoAtencionDias: [null, [Validators.min(0)]],
    plazoAtencionUrgente: [false],

    folioJupiter: [null, [Validators.maxLength(255)]],
    volanteJefatura: [null, [Validators.maxLength(255)]],

  });

  saveSecondPiecesForm(): void {
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
      this.secondPiecesForm.value.fechaRecepcion,
      //this.secondPiecesForm.value.documentoEscaneado,
      this.documentoEscaneadoName,
      this.documentoEscaneadoFile,
      this.secondPiecesForm.value.documento,
      this.secondPiecesForm.value.descripcion,
      this.secondPiecesForm.value.atencion,
      this.secondPiecesForm.value.autoridadRemitente,
      this.secondPiecesForm.value.turnoJefatura,
      this.preloadedPersonaRelacionada(),
      this.preloadedTipoAsunto(),
      this.secondPiecesForm.value.volanteJefatura,
      this.secondPiecesForm.value.folioJupiter,
    );

    if(this.secondPiecesForm.value.plazoAtencionUrgente) {
      this.collectSecondPiecesInfoService.updatePlazoDeAtencionIfCheck();
    }
    
    if(
      this.secondPiecesForm.value.plazoAtencionUrgente === false ||
      this.secondPiecesForm.value.plazoAtencionUrgente === undefined
    ) {
      this.collectSecondPiecesInfoService.updatePlazoDeAtencion(
        this.secondPiecesForm.value.plazoAtencionHoras,
        this.secondPiecesForm.value.plazoAtencionDias,
        this.secondPiecesForm.value.plazoAtencionUrgente,
      );
    }


    this.modalService.openCustomDialogWithTemplate({
      template
    })
  }

}
