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

  selectedRow = this.searchStatusService.selectedRow;

  preloadedFolioInterno = this.searchStatusService.preloadedFolioInterno;

  public secondPiecesPreliminarForm: FormGroup = this.fb.group({
    oficio: ['', [Validators.required, Validators.maxLength(255)]],
    carpetaInvestigacion: [null, [Validators.maxLength(255)]],
    folioScanner: ['', [Validators.required, Validators.maxLength(255)]],
  });

  saveSecondPiecesPreliminarForm(): void {
    console.log('hola mundillo');
    console.log('pillo1',this.selectedRow());
    console.log('pillo2', this.selectedRow()[0].carpeta_investigacion);
    //console.log('folio interno desde wario', this.selectedRow().folio_interno);
    this.collectSecondPiecesInfoService.updatePreliminarSecondPiecesForm(
      this.secondPiecesPreliminarForm.value.oficio,
      this.secondPiecesPreliminarForm.value.carpetaInvestigacion,
      this.preloadedFolioInterno(),
      this.secondPiecesPreliminarForm.value.folioScanner
    );
  }

}
