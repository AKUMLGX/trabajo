import { Routes } from '@angular/router';

import { LoginPageComponent } from './domains/auth/pages/login-page/login-page.component';
import { MainLayoutComponent } from './domains/layout/components/main-layout/main-layout.component';
import { CapturePageComponent } from './domains/capture/pages/capture-page/capture-page.component';
import { TrackingPageComponent } from './domains/tracking/pages/tracking-page/tracking-page.component';
import { ReportsPageComponent } from './domains/reports/pages/reports-page/reports-page.component';
import { AssistancePageComponent } from './domains/assistance/pages/assistance-page/assistance-page.component';
import { loginGuard } from './domains/guards/login.guard';
import { PdfViewerComponent } from './domains/components/pdf-viewer/pdf-viewer.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'site/rep/consulta',
    component: MainLayoutComponent,
    canActivate: [loginGuard],
    children: [
      {
        path: 'capture',
        component: CapturePageComponent,
      },
      {
        path: 'assistance',
        component: AssistancePageComponent,
      },
      {
        path: 'tracking',
        component: TrackingPageComponent,
        children: [
          {
            path: 'pdfViewer',
            component: PdfViewerComponent
          }
        ],
      },
      {
        path: 'reports',
        component: ReportsPageComponent,
      },
    ],
  },
  // {
  //     path: '**',
  //     component: MainLayoutComponent
  // },
];
