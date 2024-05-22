import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { AsuntoService } from '../../../../../services/asunto.service';
import { CoincidencesSearchListService } from '../../../../../shared/services/coincidences-search-list.service';
import { Asunto } from '../../../../../interfaces/asuntos.interfaces';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,  
    MatStepperModule,
    MatIconModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {

  constructor(
    private fb: FormBuilder,
    private asuntoService: AsuntoService,
    private coincidencesSearchListService: CoincidencesSearchListService,
  ){}

  searchBarResultsList: Asunto[] = [];

  public userInputForm: FormGroup = this.fb.group({
    userInput: ['', [Validators.required]],
  });

  @Input() selectedSearchEntryType: string = '';

  saveuserInputForm(): void {
    console.log(this.userInputForm.value);
  }

  @Output() isSubmittedButtonHiddenEmitter = new EventEmitter(); 

  isSubmittedButtonHidden: boolean = false;

  isResultsListEmpty: boolean | undefined = undefined;

  searchFromInput() {
    this.asuntoService.searchBarCoincidences(
      this.selectedSearchEntryType,
      this.userInputForm,
    ).subscribe((results) => {
      this.searchBarResultsList = results;
      //console.log('search bar results', this.searchBarResultsList);

      if(this.searchBarResultsList.length === 0) {
        this.isResultsListEmpty = true;
      } else {
        this.isResultsListEmpty = false;
      };
      this.coincidencesSearchListService.updateResultsListStatus(
        this.isResultsListEmpty
      );

    });
    //Falta implementar
    //SI la petición fue exitosa ent adelante con lo siguiente

    
    ///////this.isResultsListEmptyStatusEmitter.emit(this.isResultsListEmpty);
    

    this.isSubmittedButtonHidden = true;
    this.isSubmittedButtonHiddenEmitter.emit(this.isSubmittedButtonHidden);
  }

  firstColumnHeader : string = 'Folio interno';
  secondColumnHeader: string = 'Carpeta de Investigación';
  thirdColumnHeader : string = 'Oficio';
  fourthColumnHeader: string = 'Autoridad remitente';
  fifthColumnHeader : string = 'Persona relacionada';

  //Dummy data, formerly used to feed table.
  // SEARCH_RESULTS = [
  //   {id: 1, folio: 'Folio 1', carpeta: 'Carpeta investigación 1', oficio: 'Oficio 1 ABCDEFGH', autoridad: 'Autoridad 1', persona: 'Persona 1',},
  //   {id: 2, folio: 'Folio 2', carpeta: 'Carpeta investigación 2', oficio: 'Oficio 2 ABCDEFGH', autoridad: 'Autoridad 2', persona: 'Persona 2',},
  //   {id: 3, folio: 'Folio 3', carpeta: 'Carpeta investigación 3', oficio: 'Oficio 3 ABCDEFGH', autoridad: 'Autoridad 3', persona: 'Persona 3',},
  //   {id: 4, folio: 'Folio 4', carpeta: 'Carpeta investigación 4', oficio: 'Oficio 4 ABCDEFGH', autoridad: 'Autoridad 4', persona: 'Persona 4',},
  // ];

  index = 0;
  btnClass: any;
  iptClass:any;

  capturedText = '';

  tabChange(data: number){
    this.index = data;
  }
  btnClickHandler() {
    if(this.btnClass) {
      this.btnClass  = '';
      this.iptClass  = '';
    } else {
    this.btnClass = 'close'
    this.iptClass = 'square'
    }
  }

  // submitSearch(event:any) {

  //   //this.capturedText = event.target.value ;

  //   console.log(event.target.value);

  // }

}
