import { Routes } from '@angular/router';
import { authGuard, roleGuard } from '../core/guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./vue/vue-module').then((m) => m.VueModule),
  },
  {
    path: 'admin-saas',
    canActivate: [authGuard, roleGuard('SUPER_ADMIN')],
    loadChildren: () =>
      import('./admin-saas/admin-saas.routes').then((m) => m.adminSaasRoutes),
  },
  {
    path: 'admin-tenant',
    canActivate: [authGuard, roleGuard('ADMIN', 'AGENT')],
    loadChildren: () =>
      import('./admin-tenant/admin-tenant.routes').then((m) => m.adminTenantRoutes),
  },
  {
    path: 'admin-client',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadChildren: () =>
      import('./admin-client/admin-client.routes').then((m) => m.adminClientRoutes),
  },
  { path: '**', redirectTo: '' },
];
