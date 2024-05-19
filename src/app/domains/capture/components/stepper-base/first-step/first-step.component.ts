import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { DocumentElectionComponent } from './document-election/document-election.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-first-step',
  standalone: true,
  imports: [
    SearchBarComponent,
    DocumentElectionComponent,
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './first-step.component.html',
  styleUrl: './first-step.component.css'
})
export class FirstStepComponent {

  firstStepButtonStatus: boolean = false;  //parece que se va. Ya no se necesitaria

  isEmptyList: boolean = true;   //esta si se ocupa pero igual hay que borrarla de aqui

  isDocumentSelected: boolean = false;

  selectedOption: any;

  enabledButton: boolean = false;

  @Output() selectedOptionEmitter = new EventEmitter(); //este hay que borrarlo, creo que no se ocupa, pero igual borramos hasta que podamos compilar

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

  showSearchBar() {
    this.isDocumentSelected = true;
  }

  //segun yo, todo lo de aqui abajo debe borrarse.

  @Output() firstStepButtonStatusEmitter = new EventEmitter();
  @Output() isEmptyListEmitter = new EventEmitter(); 

  ngOnInit() {
    setTimeout(() => {
      console.log(this.firstStepButtonStatus);
      this.firstStepButtonStatus = true;
      console.log(this.firstStepButtonStatus);
    }, 1000);
    
  }

  

  triggerSecondStep() {
    console.log(this.firstStepButtonStatus);
    this.firstStepButtonStatusEmitter.emit(this.firstStepButtonStatus);
    this.isEmptyListEmitter.emit(this.isEmptyList);
  }

}
