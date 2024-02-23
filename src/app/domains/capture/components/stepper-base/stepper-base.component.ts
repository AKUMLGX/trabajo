import { Component, ViewChild } from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { FirstStepComponent } from './first-step/first-step.component';
import { SecondStepComponent } from './second-step/second-step.component';
import { ThirdStepComponent } from './third-step/third-step.component';
import { FourthStepComponent } from './fourth-step/fourth-step.component';
import { PreliminarEuacapeFormComponent } from './third-step/preliminar-euacape-form/preliminar-euacape-form.component';
import { CdkStepper } from '@angular/cdk/stepper';

@Component({
  selector: 'app-stepper-base',
  standalone: true,
  imports: [
    MatStepperModule,
    FirstStepComponent,
    SecondStepComponent,
    ThirdStepComponent,
    FourthStepComponent,
    PreliminarEuacapeFormComponent,
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
