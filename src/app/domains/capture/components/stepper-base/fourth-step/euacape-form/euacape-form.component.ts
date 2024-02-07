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

  public euacapeForm: FormGroup = this.fb.group({
    administracion: [''],
    fechaRecepcion: [''],
    documentosEscaneados: [''],
    atencion: [null],
    descripcion: [''],
    tipoRespuesta: [null],
    autoridadSolicitante: [''],
    turnoJefatura: [''],
    respuesta: [null],
    acuse: [null],
    folioInterno: [''],
    carpetaInvestigacion: [''],
    personaRelacionada: [''],
    folioScanner: [''],
    tipoAsunto: [''],
    plazoAtencion: [''],
  });

  onSave(): void {
    console.log(this.euacapeForm.value);
  }

  openCustomModal() {
    this.modalService.openCustomDialog()
  }

}
