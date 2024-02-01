import { Component } from '@angular/core';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-euacape-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './euacape-form.component.html',
  styleUrl: './euacape-form.component.css'
})
export class EuacapeFormComponent {

  constructor(
    private fb: FormBuilder,
  ) {}

  public euacapeForm: FormGroup = this.fb.group({
    folioInterno: [''],
    carpetaInvertigacion: [''],
    oficio: [''],
    autoridadRemitente: [''],
    personaRelaciona: [''],
  });

  onSave(): void {
    console.log("Hello world");
  }

}
