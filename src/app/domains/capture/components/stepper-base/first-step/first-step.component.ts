import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { DocumentElectionComponent } from './document-election/document-election.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-first-step',
  standalone: true,
  imports: [
    SearchBarComponent,
    DocumentElectionComponent,
    CommonModule,
    MatStepperModule,
    MatIconModule,
  ],
  templateUrl: './first-step.component.html',
  styleUrl: './first-step.component.css'
})
export class FirstStepComponent {

  firstStepButtonStatus: boolean = false;

  isEmptyList: boolean = true;

  isDocumentSelected: boolean = false;

  selectedOption: any;

  enabledButton: boolean = false;

  @Output() selectedOptionEmitter = new EventEmitter();

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

  firstColumnHeader: string = 'Folio interno';
  secondColumnHeader: string = 'Carpeta de Investigación';
  thirdColumnHeader: string = 'Oficio';
  fourthColumnHeader: string = 'Autoridad remitente';
  fifthColumnHeader: string = 'Persona relacionada';

  SEARCH_RESULTS = [
    {id: 1, folio: 'Folio 1', carpeta: 'Carpeta investigación 1', oficio: 'Oficio 1 ABCDEFGH', autoridad: 'Autoridad 1', persona: 'Persona 1',},
    {id: 2, folio: 'Folio 2', carpeta: 'Carpeta investigación 2', oficio: 'Oficio 2 ABCDEFGH', autoridad: 'Autoridad 2', persona: 'Persona 2',},
    {id: 3, folio: 'Folio 3', carpeta: 'Carpeta investigación 3', oficio: 'Oficio 3 ABCDEFGH', autoridad: 'Autoridad 3', persona: 'Persona 3',},
    {id: 4, folio: 'Folio 4', carpeta: 'Carpeta investigación 4', oficio: 'Oficio 4 ABCDEFGH', autoridad: 'Autoridad 4', persona: 'Persona 4',},
  ];

  @Output() firstStepButtonStatusEmitter = new EventEmitter();
  @Output() isEmptyListEmitter = new EventEmitter(); 

  ngOnInit() {
    setTimeout(() => {
      console.log(this.firstStepButtonStatus);
      this.firstStepButtonStatus = true;
      console.log(this.firstStepButtonStatus);
    }, 1000);
    
  }

  showSearchBar() {
    this.isDocumentSelected = true;
  }

  triggerSecondStep() {
    console.log(this.firstStepButtonStatus);
    this.firstStepButtonStatusEmitter.emit(this.firstStepButtonStatus);
    this.isEmptyListEmitter.emit(this.isEmptyList);
  }

}
