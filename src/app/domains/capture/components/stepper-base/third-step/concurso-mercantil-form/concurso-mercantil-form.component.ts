import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder,
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-concurso-mercantil-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './concurso-mercantil-form.component.html',
  styleUrl: './concurso-mercantil-form.component.css'
})
export class ConcursoMercantilFormComponent {

  constructor(
    private fb: FormBuilder,
    ){ }

  public concursoMercantilForm: FormGroup = this.fb.group({
    catTipo: ['', ],
    folioScanner: [null,],
    fechaRecepcion: ['',],
    documentoEscaneado: ['',],
    descripcion: ['',],
    turnoJefatura: ['',],
    unidadAdministrativaAutoridad: ['',],
  });

  saveConcursoMercantilForm(): void {
    console.log(this.concursoMercantilForm.value);
    console.log(this.concursoMercantilForm.value.folioJupiter);
  }

}
