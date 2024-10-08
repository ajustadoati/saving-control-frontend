import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component'),
        children: [

        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./login/pages/login-page.component'),
        children: [

        ]
    },
    {
        path:'**',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];
