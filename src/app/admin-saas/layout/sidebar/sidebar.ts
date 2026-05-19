import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/service/auth.service';

@Component({
  selector: 'app-saas-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SaasSidebar {
  collapsed = input(false);
  private readonly authService = inject(AuthService);

  readonly navItems = [
    { icon: 'fa-tachometer-alt', label: 'Dashboard', route: 'dashboard' },
    { icon: 'fa-building',       label: 'Tenants',   route: 'tenants' },
  ];

  logout(): void { this.authService.logout(); }
}
