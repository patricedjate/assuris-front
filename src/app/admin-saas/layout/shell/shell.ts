import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SaasSidebar } from '../sidebar/sidebar';
import { SaasHeader } from '../header/header';

@Component({
  selector: 'app-saas-shell',
  imports: [RouterOutlet, SaasSidebar, SaasHeader],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class AdminShell {
  sidebarCollapsed = signal(false);
  toggleSidebar(): void { this.sidebarCollapsed.update((v) => !v); }
}
