import { Routes } from '@angular/router';

import { LoginPageComponent } from './domains/auth/pages/login-page/login-page.component';
import { MainLayoutComponent } from './domains/layout/components/main-layout/main-layout.component';
import { CapturePageComponent } from './domains/capture/pages/capture-page/capture-page.component';
import { TrackingPageComponent } from './domains/tracking/pages/tracking-page/tracking-page.component';
import { ReportsPageComponent } from './domains/reports/pages/reports-page/reports-page.component';
import { AssistancePageComponent } from './domains/assistance/pages/assistance-page/assistance-page.component';
import { loginGuard } from './domains/guards/login.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'site/rep/consulta',
    component: MainLayoutComponent,
    children: [
      {
        path: 'capture',
        component: CapturePageComponent,
        canActivate: [loginGuard],
      },
      {
        path: 'assistance',
        component: AssistancePageComponent,
        canActivate: [loginGuard],
      },
      {
        path: 'tracking',
        component: TrackingPageComponent,
        canActivate: [loginGuard],
      },
      {
        path: 'reports',
        component: ReportsPageComponent,
        canActivate: [loginGuard],
      },
    ],
  },
  // {
  //     path: '**',
  //     component: MainLayoutComponent
  // },
];
