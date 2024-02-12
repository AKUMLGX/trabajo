import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreliminarEuacapeService {

  constructor() { }

  OFICIO = signal('');
  TURNOJEFATURA = signal('');
  FOLIOINT = signal('');
  FOLIOSCAN = signal('');

  updateOficio(oficioEntry: string){
      this.OFICIO.set(oficioEntry);
  }
  
  updateTurnoJefatura(tJefaturaEntry: string){
    this.TURNOJEFATURA.set(tJefaturaEntry);
  }

  updateFolioInterno(folioInt: string){
    this.FOLIOINT.set(folioInt);
  }

  updateFolioScanner(folioScan: string){
    this.FOLIOSCAN.set(folioScan);
  }

}
