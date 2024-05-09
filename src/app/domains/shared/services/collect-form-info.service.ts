import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CollectFormInfoService {

  constructor() { }

  //Info from Preliminar Euacape Form

  OFICIO = signal('');
  CARPETAINV = signal<null | string>(null);
  FOLIOSCAN = signal('');

  updatePreliminarEuacapeForm(
    oficioEntry: string,
    carpetaInv: string | null,
    folioScan: string
  ){
    this.OFICIO.set(oficioEntry);
    this.CARPETAINV.set(carpetaInv);
    this.FOLIOSCAN.set(folioScan);
  }

   //Info from Euacape Form

  ADMON = signal('');
  FECHAREC = signal<null | Date>(null);
  DOCSCAN = signal('');
  DOCUMENTOEUACAPE = signal('');
  DOCUMENTOOTROS = signal('');
  DESCRIPCION = signal('');
  ATENCION = signal('');
  AUTORIDADREMI = signal('');
  TURNOJEFATURA = signal<null | string>(null);
  PERSONAREL = signal('');

  updateEuacapeForm(
    admon: string,
    fechaRec: null | Date,
    docScan:string,
    documentoEuacape: string,
    documentoOtros: string,
    descripcion: string,
    atencion: string,
    autoridadRemi: string,
    tJefaturaEntry: string | null,
    persRel: string,
  ){
    this.ADMON.set(admon);
    this.FECHAREC.set(fechaRec);
    this.DOCSCAN.set(docScan);
    this.DOCUMENTOEUACAPE.set(documentoEuacape);
    this.DOCUMENTOOTROS.set(documentoOtros);
    this.DESCRIPCION.set(descripcion);
    this.ATENCION.set(atencion);
    this.AUTORIDADREMI.set(autoridadRemi);
    this.TURNOJEFATURA.set(tJefaturaEntry);
    this.PERSONAREL.set(persRel);
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

  //Additional info if the user directly chooses Respuesta

  FOLIOINT = signal('');

  updateFolioInterno(folioInt: string){
    this.FOLIOINT.set(folioInt);
  }

  //TIPO DE ASUNTO STORE

  TIPOASUNTO = signal('');
  
  dropdownChoice(choice: string){
    this.TIPOASUNTO.set(choice);
  }

  PLAZOATENCIONHRS = signal<null | number>(null);
  PLAZOATENCIONDIAS = signal<null | number>(null);
  PLAZOATENCION = signal<null | number>(null); //este es la suma de los 2 anteriores
  PLAZOATENCIONURGENTE = signal(false); //O bien, tmb plazo atención puede ser una urgencia

  updatePlazoDeAtencion(
    plazoAtHrs: number | null,
    plazoAtDias: number | null,
    plazoAtUrgente: boolean,
  ){
    let plazoInHours: number;
    if (plazoAtHrs !== null && plazoAtDias !== null && (plazoAtUrgente === false || plazoAtUrgente === null )) {
      plazoInHours = (plazoAtHrs + (plazoAtDias * 24)); 
      return this.PLAZOATENCION.set(plazoInHours);
    } else if (plazoAtHrs !== null && plazoAtDias !== null && plazoAtUrgente === true) {
      return this.PLAZOATENCION.set(null);
    } else if (plazoAtHrs === null && plazoAtDias !== null && (plazoAtUrgente === false || plazoAtUrgente === null )) {
      plazoInHours = (plazoAtDias * 24);
      return this.PLAZOATENCION.set(plazoInHours);
    } else if (plazoAtHrs === null && plazoAtDias !== null && plazoAtUrgente === true) {
      return this.PLAZOATENCION.set(null);
    } else if (plazoAtHrs !== null && plazoAtDias === null  && (plazoAtUrgente === false || plazoAtUrgente === null )) {
      plazoInHours = plazoAtHrs;
      return this.PLAZOATENCION.set(plazoInHours);
    } else if (plazoAtHrs !== null && plazoAtDias === null  && plazoAtUrgente === true) {
      return this.PLAZOATENCION.set(null);
    } else if (plazoAtHrs === null && plazoAtDias === null && (plazoAtUrgente === false || plazoAtUrgente === null )){
      return this.PLAZOATENCION.set(null);
    } else if (plazoAtHrs === null && plazoAtDias === null && plazoAtUrgente === true) {
      return this.PLAZOATENCION.set(0);
    }
  }  

}
