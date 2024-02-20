import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-first-step',
  standalone: true,
  imports: [
    SearchBarComponent,
    CommonModule,
    MatStepperModule,
  ],
  templateUrl: './first-step.component.html',
  styleUrl: './first-step.component.css'
})
export class FirstStepComponent {

  firstStepButtonStatus: boolean = false;

  triggerSecondStep() {
    this.firstStepButtonStatus = true;
  }

}
