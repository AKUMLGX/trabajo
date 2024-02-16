import { Component } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-graphic-administracion',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './graphic-administracion.component.html',
  styleUrl: './graphic-administracion.component.css'
})
export class GraphicAdministracionComponent {

  // single = [];
  // multi = [];

  view : [number,number] = [750 ,420];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Administración';
  showYAxisLabel = true;
  yAxisLabel = 'En tramite';


  // colorScheme = {
  //   domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  // };

  single = [
    {
      "name": "Admin-1",
      "value": 200
    },
    {
      "name": "Admin-2",
      "value": 400
    },
    {
      "name": "Admin-3",
      "value": 800
    },
    {
      "name": "Admin-4",
      "value": 120
    },
    {
      "name": "Admin-5",
      "value": 130
    }
  ];



  // constructor() {
  //   Object.assign(this, { single })
  // }

  // onSelect(event) {
  //   console.log(event);
  // }

}
