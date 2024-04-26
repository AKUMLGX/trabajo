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

    @Input() dropdownChoice: string = '';

    public euacapeForm: FormGroup = this.fb.group({
      administracion: [null, [Validators.required]],
      fechaRecepcion: [null, [Validators.required]],
      documentoEscaneado: ['', [Validators.required, Validators.maxLength(255)]],
      atencion: [{value: 'Requerimiento', disabled: true},],
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
      tipoRespuesta: [{value: 'En trámite', disabled: true},],
      autoridadSolicitante: ['', [Validators.required, Validators.maxLength(255)]],
      turnoJefatura: [null, [Validators.maxLength(255)]],
      personaRelacionada: ['', [Validators.required, Validators.maxLength(255)]],
      tipoAsunto: [{value: this.collectFormInfoService.TIPOASUNTO(), disabled: true},],
      plazoAtencion: [null, [Validators.min(1)]],
      
      folioJupiter: [null, [Validators.maxLength(255)]],
      volanteJefatura: [null, [Validators.maxLength(255)]],
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
      this.collectFormInfoService.updateEuacapeForm(
        this.euacapeForm.value.administracion,
        this.euacapeForm.value.fechaRecepcion,
        this.euacapeForm.value.documentoEscaneado,
        this.isApertura ? 'Requerimiento' : this.euacapeForm.value.atencion,
        this.euacapeForm.value.descripcion,
        this.isApertura ? 'En trámite' : this.euacapeForm.value.tipoRespuesta,
        this.euacapeForm.value.autoridadSolicitante,
        this.euacapeForm.value.turnoJefatura,
        this.euacapeForm.value.personaRelacionada,
        this.euacapeForm.value.plazoAtencion,
      );
      // if (
      //     this.dropdownChoice === 'Civil' || this.dropdownChoice === 'Penal'
      //     || this.dropdownChoice === 'Generalidades'
      //   ){
      //   this.collectFormInfoService.updateAdditionalInfoForCivilPenalAndGeneralidades(
      //     this.euacapeForm.value.autoridadAdministrativa,
      //     this.euacapeForm.value.folioJupiter,
      //   );
      // }
      // if (this.dropdownChoice === 'Concurso mercantil'){
      //   this.collectFormInfoService.updateAdditionalInfoForConcurso(this.euacapeForm.value.folioJupiter);
      // }
      this.modalService.openCustomDialogWithTemplate({
        template
      })
    }
}
