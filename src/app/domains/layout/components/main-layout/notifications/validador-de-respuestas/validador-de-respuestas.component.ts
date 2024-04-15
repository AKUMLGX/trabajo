import { Component } from '@angular/core';
import {MatTabContent, MatTabsModule} from '@angular/material/tabs';
import { RequerimientosComponent } from './tabs/requerimientos/requerimientos.component';
import {MatIconModule} from '@angular/material/icon';
import { VisualizadorComponent } from './tabs/visualizador/visualizador.component';
import { RespuestaComponent } from './tabs/respuesta/respuesta.component';

@Component({
  selector: 'app-validador-de-respuestas',
  standalone: true,
  imports: [MatTabsModule,MatTabContent,RequerimientosComponent,MatIconModule,VisualizadorComponent,RespuestaComponent ],
  templateUrl: './validador-de-respuestas.component.html',
  styleUrl: './validador-de-respuestas.component.css'
})
export class ValidadorDeRespuestasComponent {

}
