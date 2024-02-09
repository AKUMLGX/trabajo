import { Component, Input, TemplateRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-preliminar-euacape-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    CommonModule,
  ],
  templateUrl: './preliminar-euacape-form.component.html',
  styleUrl: './preliminar-euacape-form.component.css'
})
export class PreliminarEuacapeFormComponent {

  constructor(private fb: FormBuilder,){

  }

  public preliminarEuacapeForm: FormGroup = this.fb.group({
    oficio: [''],
    turnoJefatura: [''],
    folioInterno: [''],
    folioScanner: [''],
  });

  savePreliminarEuacapeForm(): void {
    console.log(this.preliminarEuacapeForm.value);
  }

}
