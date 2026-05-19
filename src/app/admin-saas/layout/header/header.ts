import { Component, inject, input, output } from '@angular/core';
import { AuthService } from '../../../../core/service/auth.service';

@Component({
  selector: 'app-saas-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class SaasHeader {
  collapsed = input(false);
  toggleSidebar = output<void>();
  private readonly authService = inject(AuthService);

  get username(): string { return this.authService.getTenantId() ?? 'Super Admin'; }
  onToggle(): void { this.toggleSidebar.emit(); }
}
