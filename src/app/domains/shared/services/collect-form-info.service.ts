import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CollectFormInfoService {

  constructor() { }

  //Info from Preliminar Euacape Form

  OFICIO = signal('');
  CARPETAINV = signal<null | string>(null);
  FOLIOINT = signal('');
  FOLIOSCAN = signal('');

  updatePreliminarEuacapeForm(
    oficioEntry: string,
    carpetaInv: string | null,
    folioInt: string,
    folioScan: string
  ){
    this.OFICIO.set(oficioEntry);
    this.CARPETAINV.set(carpetaInv);
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
  AUTORIDADREMI = signal('');
  TURNOJEFATURA = signal<null | string>(null);
  PERSONAREL = signal('');
  PLAZOATENCION = signal<null | number>(null);

  updateEuacapeForm(
    admon: string,
    fechaRec: null | Date,
    docScan:string,
    atencion: string,
    descripcion: string,
    tipoRes: string,
    autoridadRemi: string,
    tJefaturaEntry: string | null,
    persRel: string,
    plazoAt: number | null,
  ){
    this.ADMON.set(admon);
    this.FECHAREC.set(fechaRec);
    this.DOCSCAN.set(docScan);
    this.ATENCION.set(atencion);
    this.DESCRIPCION.set(descripcion);
    this.TIPORES.set(tipoRes);
    this.AUTORIDADREMI.set(autoridadRemi);
    this.TURNOJEFATURA.set(tJefaturaEntry);
    this.PERSONAREL.set(persRel);
    this.PLAZOATENCION.set(plazoAt);
  }

  //Additional info if the user chooses the Civil or Penal path.

  AUTORIDADADMINISTRATIVA = signal<null | string>(null);
  FOLIOJUPITER = signal<null | string>(null);

  updateAdditionalInfoForCivilPenalAndGeneralidades(
    autoridadAdmin: string | null,
    folioJupiter: string | null,
  ){
    this.AUTORIDADADMINISTRATIVA.set(autoridadAdmin);
    this.FOLIOJUPITER.set(folioJupiter);
  }
  
  updateAdditionalInfoForConcurso(folioJupiter: string | null){
    this.FOLIOJUPITER.set(folioJupiter);
  }

  TIPOASUNTO = signal('');
  
  dropdownChoice(choice: string){
    this.TIPOASUNTO.set(choice);
  }

}
