import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';

@Component({
  selector: 'app-content-page',
  standalone: true,
  imports: [InitTemplateComponent],
  templateUrl: './content-page.component.html',
  styleUrl: './content-page.component.css'
})
export class ContentPageComponent {

}
