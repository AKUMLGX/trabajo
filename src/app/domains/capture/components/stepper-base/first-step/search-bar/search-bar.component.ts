import { 
  Component, 
  EventEmitter, 
  Input, 
  Output, 
  TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';

import { AsuntoService } from '../../../../../services/asunto.service';
import { SearchStatusService } from '../../../../../shared/services/search-status.service';
import { Asunto } from '../../../../../interfaces/asuntos.interfaces';
import { ModalService } from '../../../../../shared/services/modal.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    FormsModule,
    MatStepperModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {

  constructor(
    private fb: FormBuilder,
    private asuntoService: AsuntoService,
    private searchStatusService: SearchStatusService,
    private modalService: ModalService,
  ) { }

  selectionModel = new SelectionModel(false);

  searchBarResultsList: Asunto[] = [];

  selectedRow: any;

  public userInputForm: FormGroup = this.fb.group({
    userInput: ['', [Validators.required]],
  });

  @Input() selectedSearchEntryType: string = '';

  saveuserInputForm(): void {}

  @Output() isSubmittedButtonHiddenEmitter = new EventEmitter();

  isSubmittedButtonHidden: boolean = false;

  isResultsListEmpty: boolean | undefined = undefined;

  folioInternoFromResults: string = '';

  isNextButtonEnabled = false;

  manuallyForceRedirectToAperturasFlux: boolean = false;

  searchFromInput() {
    this.asuntoService.searchBarCoincidences(
      this.selectedSearchEntryType,
      this.userInputForm,
    ).subscribe((results) => {
      this.searchBarResultsList = results;
      //console.log('search bar results', this.searchBarResultsList);

      if (this.searchBarResultsList.length === 0) {
        this.isResultsListEmpty = true;
      } else {
        this.isResultsListEmpty = false;
      };
      this.searchStatusService.updateResultsListStatus(
        this.isResultsListEmpty
      );

    });
    //Falta implementar
    //SI la petición fue exitosa ent adelante con lo siguiente


    ///////this.isResultsListEmptyStatusEmitter.emit(this.isResultsListEmpty);


    this.isSubmittedButtonHidden = true;
    this.isSubmittedButtonHiddenEmitter.emit(this.isSubmittedButtonHidden);
  }

  tryNext() {
    console.log('selectionMOdel-array', this.selectionModel.selected);
    this.selectedRow = this.selectionModel.selected;
    this.searchStatusService.updateSelectedRow(this.selectedRow);
  }

  reactToCheck() {
    this.selectedRow = this.selectionModel.selected;
    this.searchStatusService.updateSelectedRow(this.selectedRow);
    this.isNextButtonEnabled = true;
    this.searchStatusService.updateNextButtonStatus(this.isNextButtonEnabled);
  }

  openCustomModalWithTemplate(template: TemplateRef<any>){
    this.isNextButtonEnabled = true;
    this.searchStatusService.updateNextButtonStatus(this.isNextButtonEnabled);

    this.manuallyForceRedirectToAperturasFlux = true;
    this.searchStatusService.manuallyRedirectToAperturas(
      this.manuallyForceRedirectToAperturasFlux
    );
    this.modalService.openCustomDialogWithTemplate({
      template
    });
  }

  onCancelButton() {
    this.isNextButtonEnabled = false;
    this.searchStatusService.updateNextButtonStatus(this.isNextButtonEnabled);

    this.manuallyForceRedirectToAperturasFlux = false;
    this.searchStatusService.manuallyRedirectToAperturas(
      this.manuallyForceRedirectToAperturasFlux
    );
  }

  firstColumnHeader: string = 'Folio interno';
  secondColumnHeader: string = 'Carpeta de Investigación';
  thirdColumnHeader: string = 'Oficio';
  fourthColumnHeader: string = 'Autoridad remitente';
  fifthColumnHeader: string = 'Administración'
  sixthColumnHeader: string = 'Persona relacionada';

  //Dummy data, formerly used to feed table.
  // SEARCH_RESULTS = [
  //   {id: 1, folio: 'Folio 1', carpeta: 'Carpeta investigación 1', oficio: 'Oficio 1 ABCDEFGH', autoridad: 'Autoridad 1', persona: 'Persona 1',},
  //   {id: 2, folio: 'Folio 2', carpeta: 'Carpeta investigación 2', oficio: 'Oficio 2 ABCDEFGH', autoridad: 'Autoridad 2', persona: 'Persona 2',},
  //   {id: 3, folio: 'Folio 3', carpeta: 'Carpeta investigación 3', oficio: 'Oficio 3 ABCDEFGH', autoridad: 'Autoridad 3', persona: 'Persona 3',},
  //   {id: 4, folio: 'Folio 4', carpeta: 'Carpeta investigación 4', oficio: 'Oficio 4 ABCDEFGH', autoridad: 'Autoridad 4', persona: 'Persona 4',},
  // ];

  index = 0;
  btnClass: any;
  iptClass: any;

  capturedText = '';

  tabChange(data: number) {
    this.index = data;
  }
  btnClickHandler() {
    if (this.btnClass) {
      this.btnClass = '';
      this.iptClass = '';
    } else {
      this.btnClass = 'close'
      this.iptClass = 'square'
    }
  }

}
