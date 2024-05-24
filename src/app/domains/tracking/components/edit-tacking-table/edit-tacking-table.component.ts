import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, TemplateRef } from '@angular/core';
import { FormComponent } from '../../../capture/components/stepper-base/third-step/preliminar-form/form/form.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ModalService } from '../../../shared/services/modal.service';
import { EditTackingTableService } from '../../../services/edit-tacking-table.service';
import { Asunto } from '../../../interfaces/asuntos.interfaces';


@Component({
  selector: 'app-edit-tacking-table',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    FormComponent
  ],
  templateUrl: './edit-tacking-table.component.html',
  styleUrl: './edit-tacking-table.component.css'
})
export class EditTackingTableComponent {
constructor(private fb:FormBuilder,
//  private modalService:ModalService,
  private updateSerivce: EditTackingTableService
  ){}


public updateTableForm: FormGroup = this.fb.group({
  carpetaInvestigacion: [""],
  personaRelacionada:[''],
  folioScanner:[""],
  volanteJefatura:[""],
  oficio:[""],
  autoridadReminente:[""],
  folioJupiter:[""],
  descripcion:[""],
  turnoJefatura:[""],
  administracion:[""],
  });

  saveUpdateForm():void{
    console.log(this.updateTableForm);
    const formData = this.updateTableForm.value

      // const dataSend: Asunto = {
      //   carpeta_investigacion: formData.carpetaInvestigacion,
      //   persona_relacionada: formData.personaRelacionada,
      //   folio_scanner:formData.folioScanner,
      //   oficio:formData.oficio,
      //   autoridad_remitente:formData.autoridadReminente,
      //   folio_jupiter:formData.folioJupiter,
      //   descripcion:formData.descripcion,
      //   turno_jefatura:formData.turnoJefatura,
      //   administracion:formData.administracion
      // }

      // const dataSend: Asunto = {
      //   carpeta_investigacion:  formData.value.carpetaInvestigacion,
      //   persona_relacionada:    formData.value.personaRelacionada,
      //   folio_scanner:          formData.value.folioScanner,
      //   oficio:                 formData.value.oficio,
      //   autoridad_remitente:    formData.value.autoridadReminente,
      //   folio_jupiter:          formData.value.folioJupiter,
      //   descripcion:            formData.value.descripcion,
      //   turno_jefatura:         formData.value.turnoJefatura,
      //   administracion:         formData.value.administracion
      // }

    // this.updateSerivce.updateTrackingTable(dataSend).subscribe(response =>{
    //   console.log("Datos enviados exitosamente:", response);

    // })

  }


// openCustomModalWithTemplate(template: TemplateRef<any>){
//   const formData = this.updateTableForm.value

//   // const dataSend: Asunto = {
//   //       carpeta_investigacion: formData.carpetaInvestigacion,
//   //       persona_relacionada: formData.personaRelacionada,
//   //       folio_scanner:formData.folioScanner,
//   //       oficio:formData.oficio,
//   //       autoridad_remitente:formData.autoridadReminente,
//   //       folio_jupiter:formData.folioJupiter,
//   //       descripcion:formData.descripcion,
//   //       turno_jefatura:formData.turnoJefatura,
//   //       administracion:formData.administracion
//   //     }

//       this.modalService.openCustomDialogWithTemplate({
//         template
//       })
// }

}


