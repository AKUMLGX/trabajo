import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CollectEuacapeInfoService {

  constructor() { }

  //Info from Preliminar Euacape Form

  OFICIO = signal('');
  TURNOJEFATURA = signal<null | string>(null);
  FOLIOINT = signal('');
  FOLIOSCAN = signal('');

  updatePreliminarEuacapeForm(
    oficioEntry: string,
    tJefaturaEntry: string,
    folioInt: string,
    folioScan: string
  ){
    this.OFICIO.set(oficioEntry);
    this.TURNOJEFATURA.set(tJefaturaEntry);
    this.FOLIOINT.set(folioInt);
    this.FOLIOSCAN.set(folioScan);
  }

   //Info from Euacape Form

  ADMON = signal('');
  FECHAREC = signal<null | Date>(null);
  DOCSCAN = signal('');
  ATENCION = signal('');
  DESCRIPCION = signal('');
  TIPORES = signal('');
  AUTORIDADSOLIC = signal('');
  CARPETAINV = signal<null | string>(null);
  PERSONAREL = signal('');
  PLAZOATENCION = signal<null | number>(null);

  updateEuacapeForm(
    admon: string,
    fechaRec: null | Date,
    docScan:string,
    atencion: string,
    descripcion: string,
    tipoRes: string,
    autoridadSol: string,
    carpetaInv: string | null,
    persRel: string,
    plazoAt: number | null,
  ){
    this.ADMON.set(admon);
    this.FECHAREC.set(fechaRec);
    this.DOCSCAN.set(docScan);
    this.ATENCION.set(atencion);
    this.DESCRIPCION.set(descripcion);
    this.TIPORES.set(tipoRes);
    this.AUTORIDADSOLIC.set(autoridadSol);
    this.CARPETAINV.set(carpetaInv);
    this.PERSONAREL.set(persRel);
    this.PLAZOATENCION.set(plazoAt);
  }
}
