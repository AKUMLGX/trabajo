import { Component, EventEmitter, Output } from '@angular/core';

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

  startStepperHandler(){
    this.isStepperInitialized = true;
    this.startStepper.emit(this.isStepperInitialized);
  }

}
