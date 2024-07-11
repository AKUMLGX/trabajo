import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CollectCivilPenalMercantilFormInfoService {

  constructor() { }

  //Info from Preliminar Civil Penal and Mercantil Form

  OFICIO = signal('');
  CARPETAINV = signal<null | string>(null);
  FOLIOSCAN = signal('');

  updatePreliminarCivilPenalMercantilForm(
    oficioEntry: string,
    carpetaInv: string | null,
    folioScan: string
  ){
    this.OFICIO.set(oficioEntry);
    this.CARPETAINV.set(carpetaInv);
    this.FOLIOSCAN.set(folioScan);
  }

  //Info from Preliminar Civil Penal and Mercantil Form

  ADMON = signal('');
  FECHAREC = signal<null | Date>(null);
  DOCSCANNAME = signal('');
  DOCSCANFILE = signal<undefined | File>(undefined);
  DOCUMENTOEUACAPE = signal('');
  DOCUMENTOOTROS = signal('');
  DESCRIPCION = signal('');
  ATENCION = signal('');
  AUTORIDADREMI = signal('');
  TURNOJEFATURA = signal<null | string>(null);
  PERSONAREL = signal('');

  VOLANTEJEFATURA = signal<null | string>(null);
  FOLIOJUPITER = signal<null | string>(null);

  updateCivilPenalMercantilForm(
    admon: string,
    fechaRec: null | Date,
    docScanName:string,
    docScanFile: undefined | File,
    documentoEuacape: string,
    documentoOtros: string,
    descripcion: string,
    atencion: string,
    autoridadRemi: string,
    tJefaturaEntry: string | null,
    persRel: string,
    volanteJefatura: string | null,
    folioJupiter: string | null,
  ){
    this.ADMON.set(admon);
    this.FECHAREC.set(fechaRec);
    this.DOCSCANNAME.set(docScanName);
    this.DOCSCANFILE.set(docScanFile);
    this.DOCUMENTOEUACAPE.set(documentoEuacape);
    this.DOCUMENTOOTROS.set(documentoOtros);
    this.DESCRIPCION.set(descripcion);
    this.ATENCION.set(atencion);
    this.AUTORIDADREMI.set(autoridadRemi);
    this.TURNOJEFATURA.set(tJefaturaEntry);
    this.PERSONAREL.set(persRel);
    this.VOLANTEJEFATURA.set(volanteJefatura);
    this.FOLIOJUPITER.set(folioJupiter);
  }

  //TIPO DE ASUNTO STORE

  TIPOASUNTO = signal('');
  
  dropdownChoice(choice: string){
    this.TIPOASUNTO.set(choice);
  }

  //HANDING PLAZO ATENCION

  PLAZOATENCIONHRS = signal<null | number>(null);
  PLAZOATENCIONDIAS = signal<null | number>(null);
  PLAZOATENCION = signal<null | number>(null); //este es la suma de los 2 anteriores
  PLAZOATENCIONURGENTE = signal(false); //O bien, tmb plazo atención puede ser una urgencia

  updatePlazoDeAtencionIfCheck() {
    this.PLAZOATENCION.set(0);
  }
  
  updatePlazoDeAtencion(
    plazoAtHrs: number | null,
    plazoAtDias: number | null,
    plazoAtUrgente: boolean,
  ){
    let plazoInHours: number;
    if (plazoAtHrs !== null && plazoAtDias !== null ) {
      plazoInHours = (plazoAtHrs + (plazoAtDias * 24)); 
      return this.PLAZOATENCION.set(plazoInHours);
    } else if (plazoAtHrs === null && plazoAtDias !== null ) {
      plazoInHours = (plazoAtDias * 24);
      return this.PLAZOATENCION.set(plazoInHours);
    } else if (plazoAtHrs !== null && plazoAtDias === null ) {
      plazoInHours = plazoAtHrs;
      return this.PLAZOATENCION.set(plazoInHours);
    } else if (plazoAtHrs === null && plazoAtDias === null && (plazoAtUrgente === false || plazoAtUrgente === undefined )){
      return this.PLAZOATENCION.set(null);
    } 
  } 

}
