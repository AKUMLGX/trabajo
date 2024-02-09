import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';
import { CardsComponent } from '../../components/dashbord/dashbord-card/cards.component';



@Component({
  selector: 'app-assistance-page',
  standalone: true,
  imports: [InitTemplateComponent,CardsComponent,],
  templateUrl: './assistance-page.component.html',
  styleUrl: './assistance-page.component.css'
})
export class AssistancePageComponent {

}
