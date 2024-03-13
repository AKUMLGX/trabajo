import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { SecondPiecesFormComponent } from './second-pieces-form/second-pieces-form.component';

@Component({
  selector: 'app-preliminar-second-pieces-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    CommonModule,
    MatIconModule,
    SecondPiecesFormComponent,
  ],
  templateUrl: './preliminar-second-pieces-form.component.html',
  styleUrl: './preliminar-second-pieces-form.component.css'
})
export class PreliminarSecondPiecesFormComponent {

  constructor(
  private fb: FormBuilder,
    
  ){ }

  public secondPiecesPreliminarForm: FormGroup = this.fb.group({
    oficio: ['', [Validators.required, Validators.maxLength(255)]],
    turnoJefatura: [null, [Validators.maxLength(255)]],
    folioInterno: ['', [Validators.required, Validators.maxLength(255)]],
    folioScanner: ['', [Validators.required, Validators.maxLength(255)]],
  });

  saveSecondPiecesPreliminarForm(): void {
    console.log(this.secondPiecesPreliminarForm.value);
    // this.collectEuacapeInfoService.updatePreliminarEuacapeForm(
    //   this.secondPiecesPreliminarForm.value.oficio,
    //   this.secondPiecesPreliminarForm.value.turnoJefatura,
    //   this.secondPiecesPreliminarForm.value.folioInterno,
    //   this.secondPiecesPreliminarForm.value.folioScanner
    // );
  }

}
