import { Component, Input, TemplateRef } from '@angular/core';
import { FormBuilder,
  FormsModule,
  FormGroup,
  Validators,
  ReactiveFormsModule } from '@angular/forms';
import { ModalService } from '../../../../../../shared/services/modal.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { InfoTableComponent } from '../form/info-table/info-table.component';
import { CollectFormInfoService } from '../../../../../../shared/services/collect-form-info.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-civil-penal-mercantil-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatTableModule,
    MatDialogModule,
    CommonModule,
    MatIconModule,
    InfoTableComponent,
    MatCheckboxModule,
  ],
  templateUrl: './civil-penal-mercantil-form.component.html',
  styleUrl: './civil-penal-mercantil-form.component.css'
})
export class CivilPenalMercantilFormComponent {

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private collectFormInfoService: CollectFormInfoService,
  ){}

  documentoEscaneadoName = '';
  documentoEscaneadoFile?:File;

  @Input() dropdownChoice = '';

  public civilPenalAndMercantilForm: FormGroup = this.fb.group({
    administracion: [null, [Validators.required]],
    fechaRecepcion: [null, [Validators.required]],

    documentoEscaneadoField:[null, [Validators.required]],

    documento: [null, [Validators.required]],

    descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
    atencion: [null, [Validators.required]],
    autoridadRemitente: ['', [Validators.required, Validators.maxLength(255)]],
    turnoJefatura: [null, [Validators.maxLength(255)]],
    personaRelacionada: ['', [Validators.required, Validators.maxLength(255)]],
    tipoAsunto: [{value: this.collectFormInfoService.TIPOASUNTO(), disabled: true},],
    plazoAtencionHoras: [null, [Validators.min(1)]],
    plazoAtencionDias: [null, [Validators.min(0)]],
    plazoAtencionUrgente: [false],

    folioJupiter: [null, [Validators.maxLength(255)]],
    volanteJefatura: [null, [Validators.maxLength(255)]],
  });

  saveCivilPenalAndMercantilForm(): void {
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

    //In this case we are NOT updating EUACAPES but Civil, Penal and Mercantil,
    //though, we are using the updateEuacapeForm method because it is useful here
    //and we can recycle it by implementing it for these paths too.
    //Luis Alejandro 10.07.24 

    this.collectFormInfoService.updateEuacapeForm(
      this.civilPenalAndMercantilForm.value.administracion,
      this.civilPenalAndMercantilForm.value.fechaRecepcion,
      this.documentoEscaneadoName,
      this.documentoEscaneadoFile,
      '',
      this.civilPenalAndMercantilForm.value.documento,
      this.civilPenalAndMercantilForm.value.descripcion,
      this.civilPenalAndMercantilForm.value.atencion,
      this.civilPenalAndMercantilForm.value.autoridadRemitente,
      this.civilPenalAndMercantilForm.value.turnoJefatura,
      this.civilPenalAndMercantilForm.value.personaRelacionada,
    );

    if(this.civilPenalAndMercantilForm.value.plazoAtencionUrgente) {
      this.collectFormInfoService.updatePlazoDeAtencionIfCheck();
    }

    if(
      this.civilPenalAndMercantilForm.value.plazoAtencionUrgente === false ||
      this.civilPenalAndMercantilForm.value.plazoAtencionUrgente === undefined
    ) {
      this.collectFormInfoService.updatePlazoDeAtencion(
        this.civilPenalAndMercantilForm.value.plazoAtencionHoras,
        this.civilPenalAndMercantilForm.value.plazoAtencionDias,
        this.civilPenalAndMercantilForm.value.plazoAtencionUrgente,
      );
    }

    this.collectFormInfoService.updateAdditionalInfoForGeneralidades(
      this.civilPenalAndMercantilForm.value.volanteJefatura,
      this.civilPenalAndMercantilForm.value.folioJupiter,
    );

    this.modalService.openCustomDialogWithTemplate({
      template
    })
  }

}
