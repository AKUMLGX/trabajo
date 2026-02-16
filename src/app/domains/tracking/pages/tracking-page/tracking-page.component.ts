import { Component, OnInit } from '@angular/core';
import { InitTemplateComponent } from '../../../shared/constants/init-template/init-template.component';
import { TrackingComponentsModule } from '../../tracking-components.module';
import { PdfViewerComponent } from '../../../components/pdf-viewer/pdf-viewer.component';
import { Router, RouterModule } from '@angular/router';
import { AsuntoService } from '../../../services/asunto.service';

@Component({
  selector: 'app-tracking-page',
  standalone: true,
  imports: [
    InitTemplateComponent,
    TrackingComponentsModule,
    PdfViewerComponent,
    RouterModule,
  ],
  templateUrl: './tracking-page.component.html',
  styleUrl: './tracking-page.component.css',
})
export class TrackingPageComponent implements OnInit {

  ngOnInit(): void {}
}
