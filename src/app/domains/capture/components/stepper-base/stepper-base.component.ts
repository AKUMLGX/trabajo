import { Component, ViewChild } from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { FirstStepComponent } from './first-step/first-step.component';
import { SecondStepComponent } from './second-step/second-step.component';
import { ThirdStepComponent } from './third-step/third-step.component';
import { FourthStepComponent } from './fourth-step/fourth-step.component';
import { PreliminarFormComponent } from './third-step/preliminar-form/preliminar-form.component';
import { RespuestaPreliminarFormComponent } from './third-step/respuesta-preliminar-form/respuesta-preliminar-form.component';
import { PreliminarSecondPiecesFormComponent } from './second-step/preliminar-second-pieces-form/preliminar-second-pieces-form.component';
import { SecondPiecesFormComponent } from './second-step/preliminar-second-pieces-form/second-pieces-form/second-pieces-form.component';
import { CollectFormInfoService } from '../../../shared/services/collect-form-info.service';
import { CoincidencesSearchListService } from '../../../shared/services/coincidences-search-list.service';

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
    private coincidencesSearchListService: CoincidencesSearchListService,
  ){}

  dropdownChoice: string = '';

  isSearchBarResultsListEmpty = this.coincidencesSearchListService.isSearchResultsListEmpty;
  
  retrieveSelectionFromSecondStep(event:string){
    console.log(event);
    this.dropdownChoice = event;
    this.collectFormInfoService.dropdownChoice(this.dropdownChoice);
  }

}
