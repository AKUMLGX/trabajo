import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';
import { TrackingFormComponent } from '../../components/tracking-form/tracking-form.component';
import { TrackingTableComponent } from '../../components/tracking-table/tracking-table.component';


@Component({
  selector: 'app-tracking-page',
  standalone: true,
  imports: [InitTemplateComponent, TrackingFormComponent, TrackingTableComponent],
  templateUrl: './tracking-page.component.html',
  styleUrl: './tracking-page.component.css'
})

export class TrackingPageComponent {}
