import { Component, OnInit } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';
import { TrackingFormComponent } from '../../components/tracking-form/tracking-form.component';
import { TrackingTableComponent } from '../../components/tracking-table/tracking-table.component';
import { PdfViewerComponent } from '../../../components/pdf-viewer/pdf-viewer.component';
import { Router, RouterModule } from '@angular/router';
import { AsuntoService } from '../../../services/asunto.service';

@Component({
  selector: 'app-tracking-page',
  standalone: true,
  imports: [
    InitTemplateComponent,
    TrackingFormComponent,
    TrackingTableComponent,
    PdfViewerComponent,
    RouterModule,
  ],
  templateUrl: './tracking-page.component.html',
  styleUrl: './tracking-page.component.css',
})
export class TrackingPageComponent implements OnInit {

  ngOnInit(): void {}
}
