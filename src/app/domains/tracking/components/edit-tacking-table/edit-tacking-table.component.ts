import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, TemplateRef } from '@angular/core';
import { FormComponent } from '../../../capture/components/stepper-base/third-step/preliminar-form/form/form.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ModalService } from '../../../shared/services/modal.service';

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
   private modalService:ModalService
  ){}


public updateTableForm: FormGroup = this.fb.group({
  carpetaInvestigacion: [''],
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
  }

}


