import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { FormComponent } from './form/form.component';
import { CollectEuacapeInfoService } from '../../../../../shared/services/collect-euacape-info.service';

@Component({
  selector: 'app-preliminar-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    CommonModule,
    MatIconModule,
    FormComponent,
  ],
  templateUrl: './preliminar-form.component.html',
  styleUrl: './preliminar-form.component.css'
})
export class PreliminarFormComponent {

  constructor(
    private fb: FormBuilder,
    private collectEuacapeInfoService : CollectEuacapeInfoService,
    ){ }

  public preliminarForm: FormGroup = this.fb.group({
    oficio: ['', [Validators.required, Validators.maxLength(255)]],
    turnoJefatura: [null, [Validators.maxLength(255)]],
    folioInterno: ['', [Validators.required, Validators.maxLength(255)]],
    folioScanner: ['', [Validators.required, Validators.maxLength(255)]],
  });

  isPreliminarEuacapeFormValid = !this.preliminarForm.valid;

  savePreliminarEuacapeForm(): void {
    console.log(this.preliminarForm.value);
    this.collectEuacapeInfoService.updatePreliminarEuacapeForm(
      this.preliminarForm.value.oficio,
      this.preliminarForm.value.turnoJefatura,
      this.preliminarForm.value.folioInterno,
      this.preliminarForm.value.folioScanner
    );
  }

}
