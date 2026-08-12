import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';
// StepperBaseComponent eliminado - componente viejo refactorizado a Tlalcalli
import { StepperTlalcalliComponent } from '../../components/stepper-base/stepper-tlalcalli/stepper-tlalcalli.component';
// import { CaptureLandingPageComponent } from '../../components/capture-landing-page/capture-landing-page.component';

@Component({
    selector: 'app-capture-page',
    imports: [
        InitTemplateComponent,
        StepperTlalcalliComponent,
        // CaptureLandingPageComponent,
    ],
    templateUrl: './capture-page.component.html',
    styleUrl: './capture-page.component.css'
})
export class CapturePageComponent {

  isStepperInitialized = false;

  startStepperFromChild(event: boolean){
    this.isStepperInitialized = event;
  }

}
