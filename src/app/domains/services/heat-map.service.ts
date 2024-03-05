import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeatMapService {

  constructor() { }


//   dateDifference(fechaActual:Date, fechaCaptura:Date): number {
//    debugger
//       const dayMil= 1000*60*60*24
//       // const diffDay = Math.round(Math.abs(fechaCaptura.getTime()-fechaActual.getTime()/dayMil))
//       // return diffDay
//       const diferenciaMili = fechaCaptura.getTime() - fechaActual.getTime()
//       const diferencia = Math.round(Math.abs(Math.floor( diferenciaMili / dayMil)))
//       return diferencia
//   }


//   subtractFromDateDifference(differenceDate:number,plazaDeAtencion:number):number{
// debugger
//     return plazaDeAtencion - differenceDate
//   }

//   getCssClass(result:number):string{
//     debugger
//     if(result<5){
//       return "green"
//     }else if(result<=15){
//       return "yellow"
//     }else{
//       return "red"
//     }
//   }
//opcion 01
// calculateDateDifference(fechaActual: Date, fechaCaptura: Date): number {
//   //debugger
//   const oneDay = 24 * 60 * 60 * 1000;
//   const diffDays = Math.round(Math.abs((fechaActual.getTime() - fechaCaptura.getTime()) / oneDay));
//   return diffDays;
// }


// calculateDifference(currentDate: Date, userDates: Date[], num: number | null): number[] {
//   return userDates.map(date => {
//     const diffTime = Math.abs(currentDate.getTime() - date.getTime());
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   });
// }





}
