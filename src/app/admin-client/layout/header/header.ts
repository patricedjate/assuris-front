import { Component, inject, input, output } from '@angular/core';
import { AuthService } from '../../../../core/service/auth.service';

@Component({
  selector: 'app-client-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class ClientHeader {
  collapsed = input(false);
  toggleSidebar = output<void>();
  private readonly authService = inject(AuthService);

  get tenantId(): string { return this.authService.getTenantId() ?? ''; }

  onToggle(): void { this.toggleSidebar.emit(); }
}
