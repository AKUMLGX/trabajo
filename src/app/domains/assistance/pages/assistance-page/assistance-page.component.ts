import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';
import { CardsComponent } from '../../components/dashbord/dashbord-card/cards.component';
import { RouterModule } from '@angular/router';
import { TramitePageComponent } from '../tramite-page/tramite-page.component';



@Component({
  selector: 'app-assistance-page',
  standalone: true,
  imports: [InitTemplateComponent,CardsComponent,RouterModule,TramitePageComponent],
  templateUrl: './assistance-page.component.html',
  styleUrl: './assistance-page.component.css',
})
export class AssistancePageComponent {

  mostrarPadre= true

ocultarPadre(){
  this.mostrarPadre=false
}

volveramostrar=true



}
