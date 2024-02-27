import { Component } from '@angular/core';
import { AbstractControl, FormsModule } from '@angular/forms';
import { FormBuilder,
  FormControl, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';
import { CivilIndividualFieldComponent } from './civil-individual-field/civil-individual-field.component';


@Component({
  selector: 'app-civil-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CivilIndividualFieldComponent,
  ],
  templateUrl: './civil-form.component.html',
  styleUrl: './civil-form.component.css'
})
export class CivilFormComponent {

  constructor(
    private fb: FormBuilder,
    ){ }

  public civilForm: FormGroup = this.fb.group({
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

  saveCivilForm(): void {
    console.log(this.civilForm.value);
    console.log(this.civilForm.value.folioJupiter);
  }

  public asFormControl = (formControl: AbstractControl): FormControl =>
    formControl as FormControl;

}
