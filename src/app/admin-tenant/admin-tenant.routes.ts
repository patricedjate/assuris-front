import { Routes } from '@angular/router';
import { TenantShell } from './layout/shell/shell';

export const adminTenantRoutes: Routes = [
  {
    path: '',
    component: TenantShell,
    children: [
      { path: '',              redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    loadComponent: () => import('./dashboard/dashboard').then((m) => m.TenantDashboard) },
      { path: 'clients',      loadComponent: () => import('./clients/clients').then((m) => m.TenantClients) },
      { path: 'utilisateurs', loadComponent: () => import('./utilisateurs/utilisateurs').then((m) => m.TenantUtilisateurs) },
      { path: 'polices',      loadComponent: () => import('./polices/polices').then((m) => m.TenantPolices) },
      { path: 'sinistres',    loadComponent: () => import('./sinistres/sinistres').then((m) => m.TenantSinistres) },
      { path: 'paiements',    loadComponent: () => import('./paiements/paiements').then((m) => m.TenantPaiements) },
      { path: 'commissions',  loadComponent: () => import('./commissions/commissions').then((m) => m.TenantCommissions) },
      { path: 'rapports',     loadComponent: () => import('./rapports/rapports').then((m) => m.TenantRapports) },
      { path: 'configuration',loadComponent: () => import('./configuration/configuration').then((m) => m.TenantConfiguration) },
    ],
  },
];
