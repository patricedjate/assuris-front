import { Routes } from '@angular/router';
import { ClientShell } from './layout/shell/shell';

export const adminClientRoutes: Routes = [
  {
    path: '',
    component: ClientShell,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardPage),
      },
      {
        path: 'police',
        loadComponent: () => import('./police/police').then((m) => m.ClientPolice),
      },
      {
        path: 'sinistres',
        loadComponent: () => import('./sinistres/sinistres').then((m) => m.ClientSinistres),
      },
      {
        path: 'commissions',
        loadComponent: () => import('./commissions/commissions').then((m) => m.ClientCommissions),
      },
      {
        path: 'reseau',
        loadComponent: () => import('./reseau/reseau').then((m) => m.ClientReseau),
      },
      {
        path: 'profil',
        loadComponent: () => import('./profil/profil').then((m) => m.ClientProfil),
      },
    ],
  },
];
