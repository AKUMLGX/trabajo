import { Component } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';
import { TrackingFormComponent } from '../../components/tracking-form/tracking-form.component';
import { TrackingTableComponent } from '../../components/tracking-table/tracking-table.component';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-tracking-page',
  standalone: true,
  imports: [InitTemplateComponent, TrackingFormComponent, TrackingTableComponent, RouterModule],
  templateUrl: './tracking-page.component.html',
  styleUrl: './tracking-page.component.css'
})

export class TrackingPageComponent {}
