import { Component } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { FirstStepComponent } from './first-step/first-step.component';

@Component({
  selector: 'app-stepper-base',
  standalone: true,
  imports: [
    MatStepperModule,
    FirstStepComponent,
  ],
  templateUrl: './stepper-base.component.html',
  styleUrl: './stepper-base.component.css'
})
export class StepperBaseComponent {

}
