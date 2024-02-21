import { Component, TemplateRef } from '@angular/core';
import { DropdownComponent } from './dropdown/dropdown.component';
import { MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../../shared/services/modal.service';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-second-step',
  standalone: true,
  imports: [
    DropdownComponent,
    MatStepperModule,
    CommonModule,
    MatDialogModule,
  ],
  templateUrl: './second-step.component.html',
  styleUrl: './second-step.component.css'
})
export class SecondStepComponent {

  constructor(
    private modalService: ModalService,
    ){}

  selectedOption: any;

  enabledButton: boolean = false;

  isSecondStepPressed: boolean = false;

  retrieveSelectionFromDropdown(event:any){
    this.selectedOption = event;
    //console.log("Estoy -*recibiendo o nelson");
    console.log(this.selectedOption);
    if(this.selectedOption !== undefined){
      this.enabledButton = true;
    } else {
      this.enabledButton = false;
    }
     return this.enabledButton;
   }

  proceedToStepThreeHandler(){
    console.log(this.selectedOption.name);
  }

   openCustomModalWithTemplate(template: TemplateRef<any>){
     this.modalService.openCustomDialogWithTemplate({
       template
     });
     this.isSecondStepPressed = true;
   }

   modalCancelButton(){
    this.isSecondStepPressed = false;
   }

  



}
