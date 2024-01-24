import { Routes } from '@angular/router';

import { LoginPageComponent } from './domains/auth/pages/login-page/login-page.component';
import { DashboardPageComponent } from './domains/dashboard/pages/dashboard-page/dashboard-page.component';
import { MainLayoutComponent } from './domains/layout/components/main-layout/main-layout.component';
import { ContentPageComponent } from './domains/content/pages/content-page/content-page.component';
import { CommentsPageComponent } from './domains/comments/pages/comments-page/comments-page.component';
import { AnalyticsPageComponent } from './domains/analytics/pages/analytics-page/analytics-page.component';

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
                path: 'dashboard',
                component: DashboardPageComponent
            },
            {
                path: 'content',
                component: ContentPageComponent
            },
            {
                path: 'comments',
                component: CommentsPageComponent
            },
            {
                path: 'analytics',
                component: AnalyticsPageComponent
            },
        ]
    },
    // {
    //     path: '**',
    //     component: MainLayoutComponent
    // },
];
