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
import { CollectSecondPiecesInfoService } from '../../../../../shared/services/collect-second-pieces-info.service';
import { SearchStatusService } from '../../../../../shared/services/search-status.service';

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
    private collectSecondPiecesInfoService: CollectSecondPiecesInfoService,
    private searchStatusService: SearchStatusService,
  ){ }

  preloadedFolioInterno = this.searchStatusService.folioInternoFromSelectedRow;
  preloadedCarpetaInvestigacion = this.searchStatusService.carpetaInvestigacionFromSelectedRow;

  public secondPiecesPreliminarForm: FormGroup = this.fb.group({
    oficio: ['', [Validators.required, Validators.maxLength(255)]],
    folioScanner: ['', [Validators.required, Validators.maxLength(255)]],
  });

  saveSecondPiecesPreliminarForm(): void {
    this.collectSecondPiecesInfoService.updatePreliminarSecondPiecesForm(
      this.secondPiecesPreliminarForm.value.oficio,
      this.preloadedCarpetaInvestigacion(),
      this.preloadedFolioInterno(),
      this.secondPiecesPreliminarForm.value.folioScanner
    );
  }

}
