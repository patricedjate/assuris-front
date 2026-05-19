import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClientSidebar } from '../sidebar/sidebar';
import { ClientHeader } from '../header/header';

@Component({
  selector: 'app-client-shell',
  imports: [RouterOutlet, ClientSidebar, ClientHeader],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class ClientShell {
  sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }
}
