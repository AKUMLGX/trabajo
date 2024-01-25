import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [InitTemplateComponent],
  templateUrl: './analytics-page.component.html',
  styleUrl: './analytics-page.component.css'
})
export class AnalyticsPageComponent {

}
