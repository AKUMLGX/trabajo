import { Component, Input, TemplateRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { EuacapeFormComponent } from './euacape-form/euacape-form.component';
import { PreliminarEuacapeService } from '../../../../../shared/services/preliminar-euacape.service';

@Component({
  selector: 'app-preliminar-euacape-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    CommonModule,
    EuacapeFormComponent,
  ],
  templateUrl: './preliminar-euacape-form.component.html',
  styleUrl: './preliminar-euacape-form.component.css'
})
export class PreliminarEuacapeFormComponent {

  constructor(
    private fb: FormBuilder,
    private preliminarEuacapeService : PreliminarEuacapeService,
    ){
    
  }

  OFICIO = '';
  TURNOJEFATURA = '';
  FOLIOINT = '';
  FOLIOSCAN = '';

  public preliminarEuacapeForm: FormGroup = this.fb.group({
    oficio: [''],
    turnoJefatura: [''],
    folioInterno: [''],
    folioScanner: [''],
  });

  savePreliminarEuacapeForm(): void {
    console.log(this.preliminarEuacapeForm.value);
    // this.OFICIO = this.preliminarEuacapeForm.value.oficio;
    // this.TURNOJEFATURA = this.preliminarEuacapeForm.value.turnoJefatura;
    // this.FOLIOINT = this.preliminarEuacapeForm.value.folioInterno;
    // this.FOLIOSCAN = this.preliminarEuacapeForm.value.folioScanner;
    this.preliminarEuacapeService.updateOficio(this.preliminarEuacapeForm.value.oficio);
    this.preliminarEuacapeService.updateTurnoJefatura(this.preliminarEuacapeForm.value.turnoJefatura);
    this.preliminarEuacapeService.updateFolioInterno(this.preliminarEuacapeForm.value.folioInterno);
    this.preliminarEuacapeService.updateFolioScanner(this.preliminarEuacapeForm.value.folioScanner);
  }

}
