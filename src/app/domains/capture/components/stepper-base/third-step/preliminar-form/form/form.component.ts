import { Component, Input, TemplateRef } from '@angular/core';
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
import { InfoTableComponent } from './info-table/info-table.component';
import { CollectFormInfoService } from '../../../../../../shared/services/collect-form-info.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-form',
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
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private collectFormInfoService: CollectFormInfoService,
    ){}

    isApertura: boolean = true; //este campo debe venir en un futuro desde la search bar

    documentoEscaneadoName: string = '';
    documentoEscaneadoFile?:File;

    @Input() dropdownChoice: string = '';

    public euacapeForm: FormGroup = this.fb.group({
      administracion: [null, [Validators.required]],
      fechaRecepcion: [null, [Validators.required]],

      documentoEscaneadoField:[null, [Validators.required]],

      documentoEuacape: [null,],
      documentoOtros: [{value: 'Requerimiento', disabled: true},],

      descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
      atencion: [{value: 'No aplica', disabled: true},],
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

    saveEuacapeForm(): void {
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
      this.collectFormInfoService.updateEuacapeForm(
        this.euacapeForm.value.administracion,
        this.euacapeForm.value.fechaRecepcion,
        // this.euacapeForm.value.documentoEscaneado,
        this.documentoEscaneadoName,
        this.documentoEscaneadoFile,
        this.euacapeForm.value.documentoEuacape,
        'Requerimiento',
        this.euacapeForm.value.descripcion,
        (this.dropdownChoice === 'EUACAPES' || this.dropdownChoice === 'Respuesta') 
           ? 'Recibido' : 'No aplica',
        this.euacapeForm.value.autoridadRemitente,
        this.euacapeForm.value.turnoJefatura,
        this.euacapeForm.value.personaRelacionada,
      );

      if(this.euacapeForm.value.plazoAtencionUrgente) {
        this.collectFormInfoService.updatePlazoDeAtencionIfCheck();
      }

      if(
        this.euacapeForm.value.plazoAtencionUrgente === false ||
        this.euacapeForm.value.plazoAtencionUrgente === undefined
      ) {
        this.collectFormInfoService.updatePlazoDeAtencion(
          this.euacapeForm.value.plazoAtencionHoras,
          this.euacapeForm.value.plazoAtencionDias,
          this.euacapeForm.value.plazoAtencionUrgente,
        );
      }

      if (
            this.dropdownChoice === 'Penal' || this.dropdownChoice === 'Civil'
            || this.dropdownChoice === 'Laboral' || this.dropdownChoice === 'Juicio de Amparo'
            || this.dropdownChoice === 'Concurso Mercantil' || this.dropdownChoice === 'Copia de Conocimiento'
            || this.dropdownChoice === 'Respuesta'
        ) {
              this.collectFormInfoService.updateAdditionalInfoForGeneralidades(
                this.euacapeForm.value.volanteJefatura,
                this.euacapeForm.value.folioJupiter,
              );
      }

      this.modalService.openCustomDialogWithTemplate({
        template
      })
    }
}
