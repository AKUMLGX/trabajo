import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatDialog} from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { CardsgraphicComponent } from '../dashbord-graphic/Pie-chart/cardsgraphic.component';
import { GraphicAdministracionComponent } from '../dashbord-graphic/vertical-graph/graphic-administracion.component';





@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [MatIconModule,
    MatCardModule,
    RouterModule,CardsgraphicComponent,
    GraphicAdministracionComponent],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css'
})
export class CardsComponent {


}
