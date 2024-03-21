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
import { CollectEuacapeInfoService } from '../../../../../../shared/services/collect-euacape-info.service';

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
    MatIconModule,
    InfoTableComponent,
  ],
  templateUrl: './euacape-form.component.html',
  styleUrl: './euacape-form.component.css'
})
export class EuacapeFormComponent {

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private collectEuacapeInfoService: CollectEuacapeInfoService,
    ){}

    isApertura: boolean = true; //este campo debe venir en un futuro desde la search bar

    @Input() dropdownChoice: string = '';

    public euacapeForm: FormGroup = this.fb.group({
      administracion: [null, [Validators.required]],
      fechaRecepcion: [null, [Validators.required]],
      documentoEscaneado: ['', [Validators.required, Validators.maxLength(255)]],
      atencion: [{value: 'Requerimiento', disabled: true},],
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
      tipoRespuesta: [{value: 'En trámite', disabled: true},],
      autoridadSolicitante: ['', [Validators.required, Validators.maxLength(255)]],
      carpetaInvestigacion: [null, [Validators.maxLength(255)]],
      personaRelacionada: ['', [Validators.required, Validators.maxLength(255)]],
      tipoAsunto: [{value: this.collectEuacapeInfoService.TIPOASUNTO(), disabled: true},],
      plazoAtencion: [null, [Validators.min(1)]],
      autoridadAdministrativa: [null, [Validators.maxLength(255)]],
      folioJupiter: [null, [Validators.maxLength(255)]],
    });

    saveEuacapeForm(): void {
      console.log(this.euacapeForm.value);
      //this.OFICIO = this.secondEuacapeForm.value
      //this.OFICIO = this.euacapeForm.value.administracion;
      //console.log(this.OFICIO);
    }
  
    //openCustomModal() {
    //  this.modalService.openCustomDialog({
    //     title: 'Title for cutom dialog',
    //     content: 'Allo le monde, vous pouvez voir le contenu ici, une fois de plus!',
    //   });
    // }

    getToday(): string {
      return new Date().toISOString().split('T')[0]
    }
  
    openCustomModalWithTemplate(template: TemplateRef<any>){
      this.collectEuacapeInfoService.updateEuacapeForm(
        this.euacapeForm.value.administracion,
        this.euacapeForm.value.fechaRecepcion,
        this.euacapeForm.value.documentoEscaneado,
        this.isApertura ? 'Requerimiento' : this.euacapeForm.value.atencion,
        this.euacapeForm.value.descripcion,
        this.isApertura ? 'En trámite' : this.euacapeForm.value.tipoRespuesta,
        this.euacapeForm.value.autoridadSolicitante,
        this.euacapeForm.value.carpetaInvestigacion,
        this.euacapeForm.value.personaRelacionada,
        this.euacapeForm.value.plazoAtencion,
      );
      if (
          this.dropdownChoice === 'Civil' || this.dropdownChoice === 'Penal'
          || this.dropdownChoice === 'Generalidades'
        ){
        this.collectEuacapeInfoService.updateAdditionalInfoForCivilPenalAndGeneralidades(
          this.euacapeForm.value.autoridadAdministrativa,
          this.euacapeForm.value.folioJupiter,
        );
      }
      if (this.dropdownChoice === 'Concurso mercantil'){
        this.collectEuacapeInfoService.updateAdditionalInfoForConcurso(this.euacapeForm.value.folioJupiter);
      }
      this.modalService.openCustomDialogWithTemplate({
        template
      })
    }
}
