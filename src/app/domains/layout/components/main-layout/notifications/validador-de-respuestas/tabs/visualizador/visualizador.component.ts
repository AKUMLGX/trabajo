import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


export interface VisualizadorDetalle {
  descripcion:string
}

@Component({
  selector: 'app-visualizador',
  standalone: true,
  imports: [MatIconModule,CommonModule],
  templateUrl: './visualizador.component.html',
  styleUrl: './visualizador.component.css'
})
export class VisualizadorComponent {


datosVisualidaor: VisualizadorDetalle[] =[
  {
    descripcion: "Se genera formulario Civil "
  },
  {
    descripcion: "Se genera formulario Penal "
  },
  {
    descripcion: "Se genera formulario Concurso mercantil "
  },
  {
    descripcion: "Se genera formulario EUACAPE "
  },
  {
    descripcion: "Se genera formulario Generalidades "
  },
]

}
