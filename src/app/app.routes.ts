import { Routes } from '@angular/router';
import { AuthGuard } from './business/core/guards/auth.guard';
import { AuthenticatedGuard } from './business/core/guards/authenticated.guard';

export const routes: Routes = [

    {
        path: '',
        loadComponent: () => import('./shared/components/layout/layout.component'),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./business/dashboard/dashboard.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'profile',
                loadComponent: () => import('./business/profile/profile.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'tables',
                loadComponent: () => import('./business/tables/tables.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'associates',
                loadComponent: () => import('./business/associates/associates.component'),
                canActivate: [AuthGuard]
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'

            }

        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./business/auth/login/login.component'),
        canActivate: [AuthenticatedGuard]
    },
    {
        path:'**',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];
