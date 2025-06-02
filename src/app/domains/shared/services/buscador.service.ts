import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class BuscadorService {

  constructor() { }

  // buscador<T>(term: Observable<string>, datos: T[], clave: keyof T): Observable<T[]> {
  //   return term.pipe(
  //     debounceTime(300),
  //     distinctUntilChanged(),
  //     map(busq => {
  //       const lower = busq.toLocaleLowerCase();
  //       return datos.filter(item => {
  //         const value = String(item[clave]).toLowerCase();
  //         return value.includes(lower)
  //       })
  //     })
  //   )
  // }

// dummyData: { name: string; }[] = [];

//   buscar(data:string):Observable<string[]>{
//  const filteredSuggestions =this.dummyData
//       .map(item => item.name)
//       .filter(name => name.toLowerCase().includes(data.toLowerCase()));
//       return filteredSuggestions.length >8 ? of(filteredSuggestions.slice(0, 8)) : of(filteredSuggestions);
//   }


 buscar<T>(items: T[], termino: string, campo: keyof T): Observable<T[]> {
    if (!termino.trim()) return of(items);

    const filtro = termino.toLowerCase();
    return of(items).pipe(
      map(datos => datos.filter(item =>
        item[campo]?.toString().toLowerCase().includes(filtro)
      ))
    );
  }
}
