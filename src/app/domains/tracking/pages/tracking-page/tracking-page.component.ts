import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';

@Component({
  selector: 'app-tracking-page',
  standalone: true,
  imports: [InitTemplateComponent],
  templateUrl: './tracking-page.component.html',
  styleUrl: './tracking-page.component.css'
})
export class TrackingPageComponent {

}
