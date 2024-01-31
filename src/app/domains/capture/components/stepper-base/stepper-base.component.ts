import { Component } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { DropdownComponent } from './dropdown/dropdown.component';

@Component({
  selector: 'app-stepper-base',
  standalone: true,
  imports: [
    MatStepperModule,
    DropdownComponent,
  ],
  templateUrl: './stepper-base.component.html',
  styleUrl: './stepper-base.component.css'
})
export class StepperBaseComponent {

}
