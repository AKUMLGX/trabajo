import { Injectable, signal } from '@angular/core';



@Injectable({
  providedIn: 'root'
})
export class CollectformReplyInfoService {

  constructor() { }


  FOLIOINT = signal('')
  OFICIO = signal('')
  FECHAATEN = signal<null | Date>(null)
  DOCSCAN = signal('')
  //ATENENCION = signal('')
  DESCRIPCION = signal('')
   TIPORES = signal('')
  FOLIOSCAN = signal(0)



updateReplyFrom(
  oficio:string,
  fechaaAtencion: null | Date,
  documentoScan:string,
 // atencion:string,
  descripcion:string,
  tipoRespuesta:string,
  folioScan:number,
  folioInterno:string,
){
  this.OFICIO.set(oficio)
  this.FECHAATEN.set(fechaaAtencion)
  this.DOCSCAN.set(documentoScan)
  //this.ATENENCION.set(atencion)
  this.DESCRIPCION.set(descripcion)
 this.TIPORES.set(tipoRespuesta)
  this.FOLIOSCAN.set(folioScan)
  this.FOLIOINT.set(folioInterno)
}

}
