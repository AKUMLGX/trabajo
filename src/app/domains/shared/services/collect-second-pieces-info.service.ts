import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CollectSecondPiecesInfoService {

  constructor() { }

  //Info from Preliminar Second Pieces Form

  OFICIO = signal('');
  CARPETAINV = signal<null | string>(null);
  FOLIOINT = signal('');
  FOLIOSCAN = signal('');

  updatePreliminarSecondPiecesForm(
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

   //Info from Second Pieces Form

   ADMON = signal('');
   FECHAREC = signal<null | Date>(null);
   DOCSCANNAME = signal('');
   DOCSCANFILE = signal<undefined | File>(undefined);
   DOCUMENTO = signal('');
   DESCRIPCION = signal('');
   ATENCION = signal('');
   AUTORIDADREMI = signal('');
   TURNOJEFATURA = signal<null | string>(null);
   PERSONAREL = signal('');
   TIPOASUNTO = signal('');

   VOLANTEJEFATURA = signal<null | string>(null);
   FOLIOJUPITER = signal<null | string>(null);
 
   updateSecondPiecesForm(
     admon: string,
     fechaRec: null | Date,
     docScanName:string,
     docScanFile: undefined | File,
     documento: string,
     descripcion: string,
     atencion: string,
     autoridadRemi: string,
     tJefaturaEntry: string | null,
     persRel: string,
     tipoAsunto: string,
     volanteJefatura: string | null,
     folioJupiter: string | null,
     
   ){
     this.ADMON.set(admon);
     this.FECHAREC.set(fechaRec);
     this.DOCSCANNAME.set(docScanName);
     this.DOCSCANFILE.set(docScanFile);
     this.DOCUMENTO.set(documento);
     this.DESCRIPCION.set(descripcion);
     this.ATENCION.set(atencion);
     this.AUTORIDADREMI.set(autoridadRemi);
     this.TURNOJEFATURA.set(tJefaturaEntry);
     this.PERSONAREL.set(persRel);
     this.TIPOASUNTO.set(tipoAsunto);

     this.VOLANTEJEFATURA.set(volanteJefatura);
     this.FOLIOJUPITER.set(folioJupiter);
   }

  //Handling Plazo de Atención

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
