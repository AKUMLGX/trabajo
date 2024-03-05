import { Component, ViewChild } from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { FirstStepComponent } from './first-step/first-step.component';
import { SecondStepComponent } from './second-step/second-step.component';
import { ThirdStepComponent } from './third-step/third-step.component';
import { FourthStepComponent } from './fourth-step/fourth-step.component';
import { PreliminarFormComponent } from './third-step/preliminar-form/preliminar-form.component';
import { CivilFormComponent } from './third-step/civil-form/civil-form.component';
import { PenalFormComponent } from './third-step/penal-form/penal-form.component';
import { GeneralidadesFormComponent } from './third-step/generalidades-form/generalidades-form.component';
import { ConcursoMercantilFormComponent } from './third-step/concurso-mercantil-form/concurso-mercantil-form.component';

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
    CivilFormComponent,
    PenalFormComponent,
    ConcursoMercantilFormComponent,
    GeneralidadesFormComponent,
  ],
  templateUrl: './stepper-base.component.html',
  styleUrl: './stepper-base.component.css'
})
export class StepperBaseComponent {

  firstStepButtonStatus = false;

  dropdownChoice: string = '';

  buttonStatusFromFirstStepChild(event: boolean) {
    this.firstStepButtonStatus = event;
  }

  //buttonStatusFromSecondStepChild(event: boolean) {
  //  console.log(event);
  //  this.secondStepButtonStatus = event;
  //}

  retrieveSelectionFromSecondStep(event:string){
    console.log(event);
    this.dropdownChoice = event;
  }

}
