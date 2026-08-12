import { Component } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GraficaAtencionService } from '../../../../../services/grafica-atencion.service';

@Component({
    selector: 'app-cardsgraphic',
    imports: [NgxChartsModule],
    templateUrl: './cardsgraphic.component.html',
    styleUrl: './cardsgraphic.component.css'
})
export class CardsgraphicComponent {

  constructor(private graphicService: GraficaAtencionService  ){}

  get single(){
   return this.graphicService.graphicData
  }

  view : [number,number] = [400, 150];

  // options
  gradient = true;
  showLegend = true;
  showLabels = true;
  isDoughnut = false;




}
