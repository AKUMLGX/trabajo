import { Injectable, signal } from '@angular/core';
import { Asunto } from '../../interfaces/asuntos.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SearchStatusService {

  constructor() { }

  reactiveCoincidencesSearchList = signal<Asunto[]>([]);

  preloadedFolioInterno = signal('');

  isSearchResultsListEmpty = signal<boolean | undefined>(undefined);

  isNextButtonFromSearchBarComponentEnabled = signal<boolean>(false);

  selectedRow = signal<any>(undefined);

  folioInternoFromSelectedRow = signal('');
  carpetaInvestigacionFromSelectedRow = signal('');
  administracionFromSelectedRow = signal('');

  updateReactiveFolioInterno(folioFromResults: string) {
    this.preloadedFolioInterno.set(folioFromResults);
  }







  // MAÑANA HAY QUE BORRAR ESTE FOLIO INTERNO QUE USABAMOS 
  // ANTES PARA PRECARGAR



  



  updateResultsListStatus(status: boolean) {
    this.isSearchResultsListEmpty.set(status);
  }

  updateNextButtonStatus(status: boolean) {
    this.isNextButtonFromSearchBarComponentEnabled.set(status);
  }

  updateSelectedRow(row: any) {
    this.selectedRow.set(row);
    this.folioInternoFromSelectedRow.set(this.selectedRow()[0].folio_interno);
    this.carpetaInvestigacionFromSelectedRow.set(this.selectedRow()[0].carpeta_investigacion);
    this.administracionFromSelectedRow.set(this.selectedRow()[0].administracion);
  }

  // updateCoincidencesSearchList(list: Asunto[]) {
  //   this.reactiveCoincidencesSearchList.set(list);
  // }

  // isSearchResultsListEmpty(): boolean {
  //   if(this.reactiveCoincidencesSearchList.length === 0) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

}
