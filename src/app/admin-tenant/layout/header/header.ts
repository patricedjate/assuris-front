import { Component, inject, input, output } from '@angular/core';
import { AuthService } from '../../../../core/service/auth.service';

@Component({
  selector: 'app-tenant-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class TenantHeader {
  collapsed = input(false);
  toggleSidebar = output<void>();
  private readonly authService = inject(AuthService);

  get tenantId(): string { return this.authService.getTenantId() ?? ''; }
  get roleLabel(): string { return this.authService.getRole() === 'AGENT' ? 'Agent' : 'Administrateur'; }
  onToggle(): void { this.toggleSidebar.emit(); }
}
