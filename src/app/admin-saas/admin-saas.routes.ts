import { Routes } from '@angular/router';
import { AdminShell } from './layout/shell/shell';

export const adminSaasRoutes: Routes = [
  {
    path: '',
    component: AdminShell,
    children: [
      { path: '',                redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',       loadComponent: () => import('./dashboard/dashboard').then((m) => m.AdminDashboard) },
      { path: 'tenants',         loadComponent: () => import('./tenants/tenants').then((m) => m.AdminTenants) },
      { path: 'tenants/:tenantId', loadComponent: () => import('./tenant-detail/tenant-detail').then((m) => m.TenantDetail) },
    ],
  },
];
