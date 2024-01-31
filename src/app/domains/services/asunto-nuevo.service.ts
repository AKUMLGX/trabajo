import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AsuntoNuevoService {

  private _documents: String[] = ["Hola"];

  documentsUpdated:EventEmitter<String[]> = new EventEmitter();

  constructor() { }
  

  filterDocuments() {
    console.log("Buscando documentos");
    this.documentsUpdated.emit(this._documents);
  }

  getDocuments() {
    console.log("Obteniendo documentos");
  }

}
