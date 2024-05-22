import { Injectable, signal } from '@angular/core';
import { Asunto } from '../../interfaces/asuntos.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SearchStatusService {

  constructor() { }

  reactiveCoincidencesSearchList = signal<Asunto[]>([]);

  isSearchResultsListEmpty = signal<boolean | undefined>(undefined);

  updateResultsListStatus(status: boolean) {
    this.isSearchResultsListEmpty.set(status);
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
