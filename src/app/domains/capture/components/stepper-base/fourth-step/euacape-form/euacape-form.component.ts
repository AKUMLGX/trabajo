import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../../../shared/services/modal.service';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-euacape-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule, 
  ],
  templateUrl: './euacape-form.component.html',
  styleUrl: './euacape-form.component.css'
})
export class EuacapeFormComponent {

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
  ) {}

  isEuacapeSecondPartEnabled: boolean = false;

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

  onSave(): void {
    console.log(this.firstEuacapeForm.value);
    console.log(this.secondEuacapeForm.value);
  }

  openCustomModal() {
    this.modalService.openCustomDialog({
      title: 'Title for cutom dialog',
      content: 'Allo le monde, vous pouvez voir le contenu ici, une fois de plus!',
    });
  }

}
