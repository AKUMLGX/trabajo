import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map
} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuscadorService<T> {

  constructor() { }

  private data$ = new BehaviorSubject<T[]>([]);
  private searchTerm$ = new BehaviorSubject<string>('');


  setData(data: T[]) {
    this.data$.next(data);
  }

  setSearchTerm(term: string) {
    this.searchTerm$.next(term);
  }
  getFilteredData(predicate: (item: T, term: string) => boolean): Observable<T[]> {
    return combineLatest([
      this.data$,
      this.searchTerm$.pipe(debounceTime(300), distinctUntilChanged())
    ]).pipe(
      map(([data, term]) =>
        data.filter(item => predicate(item, term))
      )
    );
  }
}


