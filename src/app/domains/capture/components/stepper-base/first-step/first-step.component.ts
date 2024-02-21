import { Component, EventEmitter, Output } from '@angular/core';
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

  @Output() firstStepButtonStatusEmitter = new EventEmitter();

  ngOnInit() {
    setTimeout(() => {
      console.log(this.firstStepButtonStatus);
      this.firstStepButtonStatus = true;
      console.log(this.firstStepButtonStatus);
    }, 6000);
    
  }

  triggerSecondStep() {
    console.log(this.firstStepButtonStatus);
    this.firstStepButtonStatusEmitter.emit(this.firstStepButtonStatus);
  }

}
