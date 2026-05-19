import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TenantSidebar } from '../sidebar/sidebar';
import { TenantHeader } from '../header/header';

@Component({
  selector: 'app-tenant-shell',
  imports: [RouterOutlet, TenantSidebar, TenantHeader],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class TenantShell {
  sidebarCollapsed = signal(false);
  toggleSidebar(): void { this.sidebarCollapsed.update((v) => !v); }
}
