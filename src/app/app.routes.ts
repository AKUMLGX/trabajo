import { Routes } from '@angular/router';

import { LoginPageComponent } from './domains/auth/pages/login-page/login-page.component';
import { MainLayoutComponent } from './domains/layout/components/main-layout/main-layout.component';
import { CapturePageComponent } from './domains/capture/pages/capture-page/capture-page.component';
import { TrackingPageComponent } from './domains/tracking/pages/tracking-page/tracking-page.component';
import { ReportsPageComponent } from './domains/reports/pages/reports-page/reports-page.component';
import { AssistancePageComponent } from './domains/assistance/pages/assistance-page/assistance-page.component';
import { TramitePageComponent } from './domains/assistance/pages/tramite-page/tramite-page.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginPageComponent
    },
    {
        path: 'layout',
        component: MainLayoutComponent,
        children: [
            {
                path: 'capture',
                component: CapturePageComponent
            },
            {
                path: 'assistance',
                component: AssistancePageComponent,
            },
            {
              path: "tramite-card",
              component: TramitePageComponent,
            },
            {
                path: 'tracking',
                component: TrackingPageComponent
            },
            {
                path: 'reports',
                component: ReportsPageComponent
            },
        ]
    },
    // {
    //     path: '**',
    //     component: MainLayoutComponent
    // },
];
