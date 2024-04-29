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
  DOCUMENTO = signal('');
  DESCRIPCION = signal('');
  ATENCION = signal('');
  AUTORIDADREMI = signal('');
  TURNOJEFATURA = signal<null | string>(null);
  PERSONAREL = signal('');
  PLAZOATENCIONHRS = signal<null | number>(null);
  PLAZOATENCIONDIAS = signal<null | number>(null);
  PLAZOATENCION = signal<null | number>(null); //este es la suma de los 2 anteriores

  updateEuacapeForm(
    admon: string,
    fechaRec: null | Date,
    docScan:string,
    documento: string,
    descripcion: string,
    atencion: string,
    autoridadRemi: string,
    tJefaturaEntry: string | null,
    persRel: string,
    plazoAtHrs: number | null,
    plazoAtDias: number | null,
  ){
    this.ADMON.set(admon);
    this.FECHAREC.set(fechaRec);
    this.DOCSCAN.set(docScan);
    this.DOCUMENTO.set(documento);
    this.DESCRIPCION.set(descripcion);
    this.ATENCION.set(atencion);
    this.AUTORIDADREMI.set(autoridadRemi);
    this.TURNOJEFATURA.set(tJefaturaEntry);
    this.PERSONAREL.set(persRel);
    this.PLAZOATENCIONHRS.set(plazoAtHrs);
    this.PLAZOATENCIONDIAS.set(plazoAtDias);
  }

  //Additional info if the user chooses any of the Generalidades.

  VOLANTEJEFATURA = signal<null | string>(null);
  FOLIOJUPITER = signal<null | string>(null);

  updateAdditionalInfoForGeneralidades(
    volanteJefatura: string | null,
    folioJupiter: string | null,
  ){
    this.VOLANTEJEFATURA.set(volanteJefatura);
    this.FOLIOJUPITER.set(folioJupiter);
  }

  TIPOASUNTO = signal('');
  
  dropdownChoice(choice: string){
    this.TIPOASUNTO.set(choice);
  }

  updatePlazoDeAtencion(
    plazoAtHrs: number | null,
    plazoAtDias: number | null,
  ){
    let plazoInHours: number;
    if (plazoAtHrs !== null && plazoAtDias !== null) {
      plazoInHours = (plazoAtHrs + (plazoAtDias * 24)); 
      return this.PLAZOATENCION.set(plazoInHours);
    } else if (plazoAtHrs === null && plazoAtDias !== null) {
      plazoInHours = (plazoAtDias * 24);
      return this.PLAZOATENCION.set(plazoInHours);
    } else if (plazoAtHrs !== null && plazoAtDias === null) {
      plazoInHours = plazoAtHrs;
      return this.PLAZOATENCION.set(plazoInHours);
    } else if (plazoAtHrs === null && plazoAtDias === null){
      return this.PLAZOATENCION.set(null);
    }
  }  

}
