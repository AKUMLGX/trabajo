import { Component } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { FirstStepComponent } from './first-step/first-step.component';
import { SecondStepComponent } from './second-step/second-step.component';
import { ThirdStepComponent } from './third-step/third-step.component';
import { FourthStepComponent } from './fourth-step/fourth-step.component';
import { PreliminarFormComponent } from './third-step/preliminar-form/preliminar-form.component';
import { RespuestaPreliminarFormComponent } from './third-step/respuesta-preliminar-form/respuesta-preliminar-form.component';
import { PreliminarSecondPiecesFormComponent } from './second-step/preliminar-second-pieces-form/preliminar-second-pieces-form.component';
import { SecondPiecesFormComponent } from './second-step/preliminar-second-pieces-form/second-pieces-form/second-pieces-form.component';
import { CollectFormInfoService } from '../../../shared/services/collect-form-info.service';
import { SearchStatusService } from '../../../shared/services/search-status.service';
import { CollectCarpetaStatusService } from './../../../shared/collect-carpeta-status.service';


@Component({
  selector: 'app-stepper-base',
  standalone: true,
  imports: [
    MatStepperModule,
    FirstStepComponent,
    SecondStepComponent,
    ThirdStepComponent,
    FourthStepComponent,
    PreliminarFormComponent,
    RespuestaPreliminarFormComponent,
    PreliminarSecondPiecesFormComponent,
    SecondPiecesFormComponent,
  ],
  templateUrl: './stepper-base.component.html',
  styleUrl: './stepper-base.component.css'
})
export class StepperBaseComponent {

  constructor(
    private collectFormInfoService: CollectFormInfoService,
    private searchStatusService: SearchStatusService,
    private collectCarpetaStatusService : CollectCarpetaStatusService,
  ){}

  dropdownChoice: string = '';


  isCarpetaAvailable = this.collectCarpetaStatusService.isCarpetaAvailable;

  isCarpetaNull = this.collectCarpetaStatusService.isCarpetaNull;



  isSearchBarResultsListEmpty = this.searchStatusService.isSearchResultsListEmpty;

  isNextButtonFromSearchBarComponentEnabled =
    this.searchStatusService.isNextButtonFromSearchBarComponentEnabled;


  retrieveSelectionFromSecondStep(event:string){
    this.dropdownChoice = event;
    this.collectFormInfoService.dropdownChoice(this.dropdownChoice);
  }

}
