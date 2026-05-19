import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/service/auth.service';

@Component({
  selector: 'app-client-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class ClientSidebar {
  collapsed = input(false);
  private readonly authService = inject(AuthService);

  readonly navItems = [
    { icon: 'fa-home',          label: 'Accueil',          route: 'dashboard' },
    { icon: 'fa-file-contract', label: 'Ma Police',         route: 'police' },
    { icon: 'fa-car-crash',     label: 'Mes Sinistres',     route: 'sinistres' },
    { icon: 'fa-coins',         label: 'Mes Commissions',   route: 'commissions' },
    { icon: 'fa-project-diagram', label: 'Mon Réseau',      route: 'reseau' },
    { icon: 'fa-user-cog',      label: 'Mon Profil',        route: 'profil' },
  ];

  logout(): void {
    this.authService.logout();
  }
}
