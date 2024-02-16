import { Injectable } from '@angular/core';
import { DatosGrafica } from '../interfaces/datosGrafica.interface';

@Injectable({
  providedIn: 'root'
})
export class GraficaAtencionService {

  constructor() { }



  private data: DatosGrafica[] = [
    {
      "name": "Tramite",
      "value": 250
    },
    {
      "name": "Proceso",
      "value": 120
    },
    {
      "name": "Finalizado",
      "value": 360
    },
  ];

  get graphicData() {
    return this.data
  }
}
