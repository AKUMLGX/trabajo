import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { CardsgraphicComponent } from '../dashbord-graphic/Pie-chart/cardsgraphic.component';
import { GraphicAdministracionComponent } from '../dashbord-graphic/vertical-graph/graphic-administracion.component';
import { TrafficLightsAtencionComponent } from '../TrafficLights/traffic-lights-atencion/traffic-lights-atencion.component';





@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    RouterModule,
    CardsgraphicComponent,
    GraphicAdministracionComponent,
    TrafficLightsAtencionComponent,
  ],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css'
})
export class CardsComponent {



  mostrarSemaforo = true


  @Output() mostrarSemaforoContenido = new EventEmitter<void>()

  mostrarSemaforoN(): void {
    this.mostrarSemaforoContenido.emit()
  }



constructor(private router:Router){}
@Output() oucultar = new EventEmitter<void>()

ocultarPadre():void{
  this.oucultar.emit()
  this.router.navigate(['/layout/assistance/tramite-card'])

}
}
