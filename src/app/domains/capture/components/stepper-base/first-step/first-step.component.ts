import { Component } from '@angular/core';
import { DropdownComponent } from './dropdown/dropdown.component';

@Component({
  selector: 'app-first-step',
  standalone: true,
  imports: [
    DropdownComponent,
  ],
  templateUrl: './first-step.component.html',
  styleUrl: './first-step.component.css'
})
export class FirstStepComponent {

  proceedToStepTwo: boolean = false;

  proceedToStepTwoHandler(){
    this.proceedToStepTwo = true;
  }

}
