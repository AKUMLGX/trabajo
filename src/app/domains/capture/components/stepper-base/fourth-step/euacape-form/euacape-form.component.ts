import { Component, Input, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../../../shared/services/modal.service';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import {MatTableModule} from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-euacape-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule, 
    MatStepperModule,
    MatTableModule,
    MatDialogModule,
  ],
  templateUrl: './euacape-form.component.html',
  styleUrl: './euacape-form.component.css'
})
export class EuacapeFormComponent {

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
  ) {}

  @Input({required: true}) isEuacapeSecondPartEnabled!: boolean;

  public firstEuacapeForm: FormGroup = this.fb.group({
    oficio: [''],
    turnoJefatura: [''],
    folioInterno: [''],
    folioScanner: [''],
  });

  public secondEuacapeForm: FormGroup = this.fb.group({
    administracion: [''],
    fechaRecepcion: [''],
    documentosEscaneados: [''],
    atencion: [null],
    descripcion: [''],
    tipoRespuesta: [null],
    autoridadSolicitante: [''],
    respuesta: [null],
    acuse: [null],
    carpetaInvestigacion: [''],
    personaRelacionada: [''],
    tipoAsunto: [''],
    plazoAtencion: [''],
  });

  saveFirstEuacapeForm(): void{
    console.log(this.firstEuacapeForm.value);
  }

  saveSecondEuacapeForm(): void {
    console.log(this.secondEuacapeForm.value);
  }

  openCustomModal() {
    this.modalService.openCustomDialog({
      title: 'Title for cutom dialog',
      content: 'Allo le monde, vous pouvez voir le contenu ici, une fois de plus!',
    });
  }

  openCustomModalWithTemplate(template: TemplateRef<any>){
    this.modalService.openCustomDialogWithTemplate({
      template
    })
  }

  displayedColumns: string[] = ['demo-position', 'demo-name', 'demo-weight', 'demo-symbol'];
  dataSource = ELEMENT_DATA;

}
