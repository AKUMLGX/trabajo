import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder,
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-penal-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './penal-form.component.html',
  styleUrl: './penal-form.component.css'
})
export class PenalFormComponent {

  constructor(
    private fb: FormBuilder,
    ){ }

  public penalForm: FormGroup = this.fb.group({
    administracion: ['', ],
    tipoAsunto: [null,],
    oficio: ['',],
    autoridadRemitente: ['',],
    folio: ['',],
    folioJupiter: ['',],
    folioEuacape: ['',],
    carpetaInvestigacion: ['',],
    personaRelacionada: ['',],  
  });

  savePenalForm(): void {
    console.log(this.penalForm.value);
    console.log(this.penalForm.value.folioJupiter);
  }

}
