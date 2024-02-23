import { Ligths } from './../../../../../interfaces/ligths.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-traffic-lights-atencion',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './traffic-lights-atencion.component.html',
  styleUrl: './traffic-lights-atencion.component.scss'
})

export class TrafficLightsAtencionComponent  {

  public fechaSelecionada!: string;

  public lights: Ligths = {
    rojo:      false,
    verde:     false,
    amarillo:  false,
  };



//   public generarSemaforo(fecha: Date): number {

//     const fechaActual = new Date()
//     const segu = 100 * 60 * 60 * 24

//     const diferencia = Math.floor((fecha.setHours(0,0,0,0)-fechaActual.setHours(0,0,0,0)) /segu )
// debugger

//     if (diferencia < 5) {
//       return 1
//     } else if (diferencia <= 15) {
//         return 2
//     } else {
//        return 3
//     }
//   }
  public generarSemaforo(fecha: Date): number {

    const fechaActual = new Date()
    fecha.setHours(0,0,0,0)
    fechaActual.setHours(0,0,0,0)

    const diferenciaMili= fecha.getTime()-fechaActual.getTime()
    const miliSegundo= 1000*60*60*24

    const diferencia = Math.floor(diferenciaMili/miliSegundo)
//debugger

    if (diferencia < 5) {
      return 1
    } else if (diferencia <= 15) {
        return 2
    } else {
       return 3
    }
  }





     actualizarSemaforo():void{
      const [year,month,day] = this.fechaSelecionada.split("-").map(Number)
      const fecha = new Date(year,month-1,day)
    const semaforo = this.generarSemaforo(fecha)


    this.lights={
        rojo:semaforo===3,
        verde:semaforo===1,
        amarillo:semaforo===2
    }
  }
}



