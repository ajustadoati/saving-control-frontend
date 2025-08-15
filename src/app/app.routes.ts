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
                path: 'payment',
                loadComponent: () => import('./business/payment/payment.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'savings-weekly',
                loadComponent: () => import('./business/payment/savings/saving-weekly/saving-weekly.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'associates',
                loadComponent: () => import('./business/associates/associates.component'),
                canActivate: [AuthGuard]
            },{
                path: 'associate-setup',
                loadComponent: () => import('./business/associates/setup/associate-setup/associate-setup.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'special-contributions',
                loadComponent: () => import('./business/contributions/contribution/contibution.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'file',
                loadComponent: () => import('./business/file/file/file.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'loan',
                loadComponent: () => import('./business/loan/loan/loan.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'supplies',
                loadComponent: () => import('./business/supplies/supplies/supplies.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'report',
                loadComponent: () => import('./business/report/report/report.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'summary',
                loadComponent: () => import('./business/associates/summary/summary.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'summary-loans',
                loadComponent: () => import('./business/summary-loans/summary-loans.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'remove-payment',
                loadComponent: () => import('./business/remove-payment/remove-payment.component'),
                canActivate: [AuthGuard]
            },
            {
                path: 'withdraw-balance',
                loadComponent: () => import('./business/withdraw-balance/withdraw-balance.component'),
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
