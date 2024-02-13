import { Component } from '@angular/core';
import { DropdownComponent } from './dropdown/dropdown.component';
import { MatStepperModule } from '@angular/material/stepper';
import { AsuntoChoiceService } from '../../../../shared/services/asunto-choice.service';

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

  constructor(
    private asuntoChoiceService: AsuntoChoiceService,
  ){

  }

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
    console.log(this.selectedOption.name)
    this.asuntoChoiceService.choiceFromDropdown(this.selectedOption.name);
  }

}
