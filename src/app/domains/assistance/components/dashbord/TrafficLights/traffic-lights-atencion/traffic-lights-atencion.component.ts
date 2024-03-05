import { Ligths } from './../../../../../interfaces/ligths.interface';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeatMapService } from '../../../../../services/heat-map.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-traffic-lights-atencion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule,RouterModule],
  templateUrl: './traffic-lights-atencion.component.html',
  styleUrl: './traffic-lights-atencion.component.css'
})

export class TrafficLightsAtencionComponent {


datos = [
  {
  oficio: 4525,
  turno_Jefatura: 20,
  folio_interno:"2-asp-89",
  folio_scanner:"30-k23-2",
  administracion:"a_3",
  documento_escaneado:"/path/to/doc",
  descripcion:"prueba",
  autoridad_solicitante:"XXX",
  persona_relacionada:"Juan Perez",
  plazo_atencion:72,
  fecha_recepcion:"2024-08-02",
  atencion:"Requerimiento",
  tipo_repusta:"en tramite",
  caprte_investigacion:"2_R-90",
  tipo_asunto:"Euacape"
},
//   {
//   oficio: 3050,
//   turno_Jefatura: 25,
//   folio_interno:"4-ngx-12",
//   folio_scanner:"50-k23-2",
//   administracion:"a_8",
//   documento_escaneado:"/path/to/doc",
//   descripcion:"prueba",
//   autoridad_solicitante:"XXX",
//   persona_relacionada:"Juan Perez",
//   plazo_atencion:72,
//   fecha_recepcion:"2024-010-02",
//   atencion:"Requerimiento",
//   tipo_repusta:"en tramite",
//   caprte_investigacion:"2_Z-34",
//   tipo_asunto:"Euacape"
// }

]


fechaActual = new Date()
fechas = [
{ fecha: new Date('2024/03/30'),visible:true,},
{ fecha: new Date("2024/03/28"),visible:true,},
{ fecha: new Date("2024/03/25"),visible:true,},
{ fecha: new Date("2024/03/18"),visible:true,},
{ fecha: new Date("2024/03/15"),visible:true,},
{ fecha: new Date("2024/03/14"),visible:true,},
{ fecha: new Date("2024/03/13"),visible:true,},
{ fecha: new Date("2024/03/08"),visible:true,},
{ fecha: new Date("2024/03/07 "),visible:true,},
{ fecha: new Date("2024/03/06"),visible:true,},
]
 numero : number | null = null

 colorGrafica(fecha:Date,numero:number|null,):string{
 //debugger
  const diferenciaEnDias = Math.round(Math.abs(Math.floor((this.fechaActual.getDate() - fecha.getDate()))));
//debugger
  if(numero !==null && numero < 72 ){
    return 'red'
  } else if(diferenciaEnDias < 5){
    return 'green'
  }else if (diferenciaEnDias <= 15){
    return 'yellow'
  }else{
    return 'red'
  }
 }

 ocultar(index:number):void{
  this.fechas[index].visible=false
 }

}



