import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CollectEuacapeInfoService {

  constructor() { }

  OFICIO = signal('');
  TURNOJEFATURA = signal<null | string>(null);
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
