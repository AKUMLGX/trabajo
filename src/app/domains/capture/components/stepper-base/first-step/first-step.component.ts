import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { DocumentElectionComponent } from './document-election/document-election.component';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-first-step',
  standalone: true,
  imports: [
    SearchBarComponent,
    DocumentElectionComponent,
    CommonModule,
    MatIconModule,
    MatStepperModule,
  ],
  templateUrl: './first-step.component.html',
  styleUrl: './first-step.component.css'
})
export class FirstStepComponent {

  isDocumentSelected: boolean = false;

  selectedOption: any;

  submitButtonHiddenStatus: boolean = false;

  enabledButton: boolean = false;

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

  retrieveSubmitButtonStatus(event: boolean) {
    this.submitButtonHiddenStatus  = event;
  }

  showSearchBar() {
    this.isDocumentSelected = true;
  }

}
