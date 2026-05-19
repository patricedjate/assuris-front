import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/service/auth.service';

const ALL_NAV_ITEMS = [
  { icon: 'fa-tachometer-alt', label: 'Dashboard',      route: 'dashboard',     roles: ['ADMIN', 'AGENT'] },
  { icon: 'fa-users',          label: 'Clients',         route: 'clients',       roles: ['ADMIN', 'AGENT'] },
  { icon: 'fa-user-tie',       label: 'Utilisateurs',    route: 'utilisateurs',  roles: ['ADMIN'] },
  { icon: 'fa-file-alt',       label: 'Polices',         route: 'polices',       roles: ['ADMIN', 'AGENT'] },
  { icon: 'fa-car-crash',      label: 'Sinistres',       route: 'sinistres',     roles: ['ADMIN', 'AGENT'] },
  { icon: 'fa-credit-card',    label: 'Paiements',       route: 'paiements',     roles: ['ADMIN', 'AGENT'] },
  { icon: 'fa-percentage',     label: 'Commissions',     route: 'commissions',   roles: ['ADMIN'] },
  { icon: 'fa-chart-bar',      label: 'Rapports CIMA',   route: 'rapports',      roles: ['ADMIN'] },
  { icon: 'fa-cog',            label: 'Configuration',   route: 'configuration', roles: ['ADMIN'] },
];

@Component({
  selector: 'app-tenant-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class TenantSidebar {
  collapsed = input(false);
  private readonly authService = inject(AuthService);

  readonly navItems = computed(() => {
    const role = this.authService.getRole() ?? '';
    return ALL_NAV_ITEMS.filter(item => item.roles.includes(role));
  });

  get roleLabel(): string {
    return this.authService.getRole() === 'AGENT' ? 'Agent' : 'Administrateur';
  }

  logout(): void { this.authService.logout(); }
}
