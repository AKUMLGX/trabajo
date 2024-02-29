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

  updateAdministracion(admon: string) {
    this.ADMON.set(admon);
  }

  updateFechaRecepcion(fechaRec: null | Date ) {
    this.FECHAREC.set(fechaRec);
  }

  updateDocumentoEscaneado(docScan:string) {
    this.DOCSCAN.set(docScan);
  }

  updateAtencion(atencion: string) {
    this.ATENCION.set(atencion);
  }

  updateDescripcion(descripcion: string) {
    this.DESCRIPCION.set(descripcion);
  }

  updateTipoRespuesta(tipoRes: string) {
    this.TIPORES.set(tipoRes);
  }

  updateAutoridadSolicitante(autoridadSol: string) {
    this.AUTORIDADSOLIC.set(autoridadSol);
  }

  updateCarpetaInvestigacion(carpetaInv: string | null) {
    this.CARPETAINV.set(carpetaInv);
  }

  updatePersonaRelacionada(persRel: string) {
    this.PERSONAREL.set(persRel);
  }

  updatePlazoAtencion(plazoAt: number | null) {
    this.PLAZOATENCION.set(plazoAt);
  }

}
