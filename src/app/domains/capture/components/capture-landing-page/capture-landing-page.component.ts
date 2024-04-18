import { Component, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-capture-landing-page',
  standalone: true,
  imports: [],
  templateUrl: './capture-landing-page.component.html',
  styleUrl: './capture-landing-page.component.css'
})
export class CaptureLandingPageComponent {

  @Output() startStepper = new EventEmitter;

  isStepperInitialized: boolean = false;

  public environment =  environment;

  startStepperHandler(){
    this.isStepperInitialized = true;
    this.startStepper.emit(this.isStepperInitialized);
  }

}
