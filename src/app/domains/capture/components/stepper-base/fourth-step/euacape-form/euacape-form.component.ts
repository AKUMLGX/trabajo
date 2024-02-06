import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

}
