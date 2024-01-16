import { Routes } from '@angular/router';

import { LoginPageComponent } from './domains/auth/pages/login-page/login-page.component';
import { DashboardPageComponent } from './domains/dashboard/pages/dashboard-page/dashboard-page.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginPageComponent
    },
    {
        path: 'dashboard',
        component: DashboardPageComponent
    },
];
