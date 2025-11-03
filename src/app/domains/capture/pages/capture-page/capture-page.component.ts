import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';
// StepperBaseComponent eliminado - componente viejo refactorizado a Tlapohualli
import { StepperTlapohualliComponent } from '../../components/stepper-base/stepper-tlapohualli/stepper-tlapohualli.component';
import { CaptureLandingPageComponent } from '../../components/capture-landing-page/capture-landing-page.component';

@Component({
  selector: 'app-capture-page',
  standalone: true,
  imports: [
    InitTemplateComponent,
    StepperTlapohualliComponent,
    CaptureLandingPageComponent,
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
