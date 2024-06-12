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

  updateReactiveFolioInterno(folioFromResults: string) {
    this.preloadedFolioInterno.set(folioFromResults);
  }

  updateResultsListStatus(status: boolean) {
    this.isSearchResultsListEmpty.set(status);
  }

  updateNextButtonStatus(status: boolean) {
    this.isNextButtonFromSearchBarComponentEnabled.set(status);
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
