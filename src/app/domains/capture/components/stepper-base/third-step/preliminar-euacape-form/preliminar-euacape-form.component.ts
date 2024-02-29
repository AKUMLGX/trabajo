import { Component, Input, TemplateRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { EuacapeFormComponent } from './euacape-form/euacape-form.component';
import { CollectEuacapeInfoService } from '../../../../../shared/services/collect-euacape-info.service';

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
    private collectEuacapeInfoService : CollectEuacapeInfoService,
    ){ }

  public preliminarEuacapeForm: FormGroup = this.fb.group({
    oficio: ['', [Validators.required, Validators.maxLength(255)]],
    turnoJefatura: [null, [Validators.maxLength(255)]],
    folioInterno: ['', [Validators.required, Validators.maxLength(255)]],
    folioScanner: ['', [Validators.required, Validators.maxLength(255)]],
  });

  isPreliminarEuacapeFormValid = !this.preliminarEuacapeForm.valid;

  savePreliminarEuacapeForm(): void {
    console.log(this.preliminarEuacapeForm.value);
    this.collectEuacapeInfoService.updateOficio(this.preliminarEuacapeForm.value.oficio);
    this.collectEuacapeInfoService.updateTurnoJefatura(this.preliminarEuacapeForm.value.turnoJefatura);
    this.collectEuacapeInfoService.updateFolioInterno(this.preliminarEuacapeForm.value.folioInterno);
    this.collectEuacapeInfoService.updateFolioScanner(this.preliminarEuacapeForm.value.folioScanner);
  }

}
