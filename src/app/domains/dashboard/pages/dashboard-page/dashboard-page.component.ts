import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [InitTemplateComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent {

}
