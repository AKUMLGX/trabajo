import { Ligths } from './../../../../../interfaces/ligths.interface';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeatMapService } from '../../../../../services/heat-map.service';
import { RouterModule } from '@angular/router';
import { ReaplyComponent } from './reaply/reaply.component';


@Component({
  selector: 'app-traffic-lights-atencion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule, ReaplyComponent,],
  templateUrl: './traffic-lights-atencion.component.html',
  styleUrl: './traffic-lights-atencion.component.css'
})

export class TrafficLightsAtencionComponent {
  mostrarRespuesta: boolean = false
  mostrarGrafico: boolean = true
  filaSeleccionada: any
  cantidadDeSolicitudes: number = 10
  numero: number | null = null
  fechaActual = new Date()



  datos = [
    {
      folio_interno: "2-asp-89",
      oficio: 4525,
      persona_relacionada: "Juan Perez",
      autoridad_solicitante: "XXX",
      caprte_investigacion: "2_R-90",
      // fechaSocicitud: new Date("2024/03/27")
    },
    // {
    //   folio_interno: "5-uks-89",
    //   oficio: 4526,
    //   persona_relacionada: "Leopoldo Salazar",
    //   autoridad_solicitante: "ZZZ",
    //   caprte_investigacion: "3_S-40",
    //   fechaSocicitud: new Date("2024/03/25"),
    // },
    //   {
    //   folio_interno:"2-asp-89",
    //   oficio: 4527,
    //   persona_relacionada:"Juan Perez",
    //   autoridad_solicitante:"XXX",
    //   caprte_investigacion:"2_R-90",
    //   fechaSocicitud: new Date("2024/10/12")
    // },
    //   {
    //   folio_interno:"2-asp-89",
    //   oficio: 4528,
    //   persona_relacionada:"Juan Perez",
    //   autoridad_solicitante:"XXX",
    //   caprte_investigacion:"2_R-90",
    //   fechaSocicitud: new Date("2024/10/12")
    // },
    //   {
    //   folio_interno:"2-asp-89",
    //   oficio: 4529,
    //   persona_relacionada:"Juan Perez",
    //   autoridad_solicitante:"XXX",
    //   caprte_investigacion:"2_R-90",
    //   fechaSocicitud: new Date("2024/10/12")
    // },
    //   {
    //   folio_interno:"2-asp-89",
    //   oficio: 4524,
    //   persona_relacionada:"Juan Perez",
    //   autoridad_solicitante:"XXX",
    //   caprte_investigacion:"2_R-90",
    //   fechaSocicitud: new Date("2024/10/12")
    // },
    //   {
    //   folio_interno:"2-asp-89",
    //   oficio: 4523,
    //   persona_relacionada:"Juan Perez",
    //   autoridad_solicitante:"XXX",
    //   caprte_investigacion:"2_R-90",
    //   fechaSocicitud: new Date("2024/10/12")
    // },
    //   {
    //   folio_interno:"2-asp-89",
    //   oficio: 4522,
    //   persona_relacionada:"Juan Perez",
    //   autoridad_solicitante:"XXX",
    //   caprte_investigacion:"2_R-90",
    //   fechaSocicitud: new Date("2024/10/12")
    // },
    //   {
    //   folio_interno:"2-asp-89",
    //   oficio: 4521,
    //   persona_relacionada:"Juan Perez",
    //   autoridad_solicitante:"XXX",
    //   caprte_investigacion:"2_R-90",
    //   fechaSocicitud: new Date("2024/10/12")
    // },
    //   {
    //   folio_interno:"2-asp-89",
    //   oficio: 4520,
    //   persona_relacionada:"Juan Perez",
    //   autoridad_solicitante:"XXX",
    //   caprte_investigacion:"2_R-90",
    //   fechaSocicitud: new Date("2024/10/12")
    // },
  ]

  fechas = [
    { fecha: new Date("2024/11/08"), visible: true, },
    { fecha: new Date("2024/05/08"), visible: true, },
    { fecha: new Date("2024/04/20  "), visible: true, },
    { fecha: new Date("2024/04/19  "), visible: true, },
    { fecha: new Date("2024/04/15  "), visible: true, },
    { fecha: new Date("2024/04/14  "), visible: true, },
    { fecha: new Date("2024/04/13"), visible: true, },
    { fecha: new Date("2024/04/12  "), visible: true, },
    { fecha: new Date("2024/04/11"), visible: true, },
    { fecha: new Date("2024/04/10 "), visible: true, },
    { fecha: new Date("2024/04/09 "), visible: true, },
    { fecha: new Date("2024/04/08"), visible: true, },
    { fecha: new Date("2024/04/07"), visible: true, },
    { fecha: new Date("2024/04/06"), visible: true, },
    { fecha: new Date("2024/04/05 "), visible: true, },
    { fecha: new Date("2024/04/04"), visible: true, },
    { fecha: new Date("2024/04/03"), visible: true, },
    { fecha: new Date("2024/04/02"), visible: true, },
    { fecha: new Date("2024/04/01"), visible: true, },
    { fecha: new Date("2024/03/31"), visible: true, },
    { fecha: new Date("2024/03/30"), visible: true, },
    { fecha: new Date("2024/03/29"), visible: true, },
    { fecha: new Date("2024/03/28"), visible: true, },
   // { fecha: new Date("2024/03/27"), visible: true, },
   // { fecha: new Date("2024/03/26"), visible: true, },
     //{ fecha: new Date("2024/01/26"), visible: true, },
  ]


  colorGrafica(fecha: Date, numero: number | null,): string {
    //debugger
    // const diferenciaEnDias = Math.round(Math.abs(Math.floor(( fecha.getDate()-this.fechaActual.getDate()  ))));

    const milisegundosFechaActual = this.fechaActual.getTime()
    const milisegundosFecha = fecha.getTime()

    const diferenciaMilisegundos = Math.abs(milisegundosFechaActual - milisegundosFecha)

    const diferenciaEnDias = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24))



  //  debugger
    // if (numero !== null && numero < 0) {
    //   return 'red'
    // } else if (diferenciaEnDias < 6) {
    //   return 'green'
    // } else if (diferenciaEnDias <= 16) {
    //   return 'yellow'
    // } else {
    //   return 'red'
    // }
    // if (numero !== null && numero < 0) {
    //   return 'red'
    // } else if (diferenciaEnDias <= 6) {
    //   return 'green'
    // } else if (diferenciaEnDias <= 5) {
    //   return 'green-1'
    // } else {
    //   return 'red'
    // }
  if (numero !== null && numero < 0) {
       return 'red'
  }
    if (diferenciaEnDias <= 1) {
      return 'green'
    } else if (diferenciaEnDias <= 2) {
      return 'green-1'
    }
    else if (diferenciaEnDias <= 3) {
      return 'green-2'
    }
    else if (diferenciaEnDias <= 4) {
      return 'green-3'
    }
    else if (diferenciaEnDias <= 5) {
      return 'green-4'
    } else if (diferenciaEnDias <= 6) {
      return 'green-5'
    } else if (diferenciaEnDias <= 7) {
      return 'green-6'
    } else if (diferenciaEnDias <= 8) {
      return 'yellow-1'
    } else if (diferenciaEnDias <= 9) {
      return 'yellow-2'
    } else if (diferenciaEnDias <= 10) {
      return 'yellow-3'
    } else if (diferenciaEnDias <= 11) {
      return 'yellow-4'
    } else if (diferenciaEnDias <= 12) {
      return 'yellow-5'
    } else if (diferenciaEnDias <= 13) {
      return 'yellow-6'
    } else if (diferenciaEnDias <= 14) {
      return 'orange-1'
    } else if (diferenciaEnDias <= 15) {
      return 'orange-2'
    } else if (diferenciaEnDias <= 16) {
      return 'orange-3'
    } else if (diferenciaEnDias <= 17) {
      return 'orange-4'
    } else if (diferenciaEnDias <= 18) {
      return 'orange-5'
    } else if (diferenciaEnDias <= 19) {
      return 'orange-6'
    } else if (diferenciaEnDias <= 20) {
      return 'red-1'
    } else if (diferenciaEnDias <= 21) {
      return 'red-2'
    } else if (diferenciaEnDias <= 22) {
      return 'red-3'
    } else if (diferenciaEnDias <= 23) {
      return 'red-4'
    } else if (diferenciaEnDias <= 24) {
      return 'red-5'
    } else if (diferenciaEnDias <= 25) {
      return 'red'
    } else if (diferenciaEnDias <= 26) {
      return 'red'
    } else if (diferenciaEnDias <= 27) {
      return 'reed'
    }
     else if (28 <= diferenciaEnDias) {
      return 'red'
    }
    else {
      return ''
    }
  }







  // colorGrafica(fecha: Date, cantidad: number): string {
  //   const milisegundosFechaActual = this.fechaActual.getTime();
  //   const milisegundosFecha = fecha.getTime();
  //   const diferenciaMilisegundos = Math.abs(milisegundosFechaActual - milisegundosFecha);
  //   const diferenciaEnDias = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

  //   // Calculamos la proporción de cantidad
  //   const proporcionCantidad = (cantidad / 100) * 20;
  //   //debugger
  //   // Determinamos el color basado en la proporción de 5 colores y la diferenciaEnDias
  //   if (diferenciaEnDias < 5) {
  //      if (proporcionCantidad <= 20) {
  //        return 'green';
  //      } else if (proporcionCantidad <= 10) {
  //        return 'lightgreen';
  //      } else if (proporcionCantidad <= 20) {
  //        return 'yellow';
  //      } else if (proporcionCantidad <= 30) {
  //        return 'orange';
  //      } else {
  //        return 'red';
  //      }
  //   } else if (diferenciaEnDias <= 15) {
  //      if (proporcionCantidad <= 20) {
  //        return 'green';
  //      } else if (proporcionCantidad <= 10) {
  //        return 'lightgreen';
  //      } else if (proporcionCantidad <= 20) {
  //        return 'yellow';
  //      } else if (proporcionCantidad <= 30) {
  //        return 'orange';
  //      } else {
  //        return 'red';
  //      }
  //   } else {
  //      if (proporcionCantidad <= 20) {
  //        return 'green';
  //      } else if (proporcionCantidad <= 10) {
  //        return 'lightgreen';
  //      } else if (proporcionCantidad <= 20) {
  //        return 'yellow';
  //      } else if (proporcionCantidad <= 30) {
  //        return 'orange';
  //      } else {
  //        return 'red';
  //      }
  //   }
  //  }


  responder(index: number): void {
    this.fechas[index].visible = false
  }
  mostrarComponente(): void {
    this.mostrarRespuesta = !this.mostrarRespuesta
    this.mostrarGrafico = !this.mostrarGrafico
    console.log(this.mostrarGrafico);
    console.log(this.mostrarRespuesta);
  }

  seleccionarFila(fila: any) {
    this.filaSeleccionada = fila;
    console.log(this.filaSeleccionada);
  }
}



