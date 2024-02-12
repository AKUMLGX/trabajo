import { Component } from '@angular/core';
import { DropdownComponent } from './dropdown/dropdown.component';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-second-step',
  standalone: true,
  imports: [
    DropdownComponent,
    MatStepperModule,
  ],
  templateUrl: './second-step.component.html',
  styleUrl: './second-step.component.css'
})
export class SecondStepComponent {

  selectedOption: any;

  enabledButton: boolean = false;

  proceedToStepTwo: boolean = false;

  retrieveSelectionFromDropdown(event:any){
    this.selectedOption = event;
    //console.log("Estoy recibiendo o nelson");
    console.log(this.selectedOption);
    if(this.selectedOption !== undefined){
      this.enabledButton = true;
    } else {
      this.enabledButton = false;
    }
  }

  proceedToStepTwoHandler(){
    
  }

}
