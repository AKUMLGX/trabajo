import { Routes } from '@angular/router';

import { LoginPageComponent } from './domains/auth/pages/login-page/login-page.component';
import { DashboardPageComponent } from './domains/dashboard/pages/dashboard-page/dashboard-page.component';
import { MainLayoutComponent } from './domains/layout/components/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginPageComponent
    },
    {
        path: 'dashboard',
        component: DashboardPageComponent
    },
    {
        path: 'layout',
        component: MainLayoutComponent
    },

];
