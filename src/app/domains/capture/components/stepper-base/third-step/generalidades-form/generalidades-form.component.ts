import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder,
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-generalidades-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './generalidades-form.component.html',
  styleUrl: './generalidades-form.component.css'
})
export class GeneralidadesFormComponent {

  constructor(
    private fb: FormBuilder,
  ){ }

  public generalidadesForm: FormGroup = this.fb.group({
    oficio: ['', ],
    autoridadRemitente: [null,],
    administracion: ['',],
    fechaRecepcion: ['',],
    documentoEscaneado: ['',],
    descripcion: ['',],
    turnoJefatura: ['',],
    tipo: ['',],
    unidadAdministrativaAutoridad: ['',],
    folioInterno: ['',],
    carpetaInvestigacion: ['',],
    personaRelacionada: ['',],
    folioScanner: ['',],
  });

  saveGeneralidadesForm(): void {
    console.log(this.generalidadesForm.value);
    console.log(this.generalidadesForm.value.unidadAdministrativaAutoridad);
  }

}
