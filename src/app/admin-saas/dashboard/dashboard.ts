import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SuperAdminService } from '../../../core/service/super-admin.service';
import { PlatformStats, TenantSummary } from '../../../core/model/super-admin';

@Component({
  selector: 'app-super-admin-dashboard',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class AdminDashboard implements OnInit {
  private readonly svc = inject(SuperAdminService);

  stats = signal<PlatformStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.svc.getStats().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger les statistiques.'); this.loading.set(false); },
    });
  }

  recentTenants(tenants: TenantSummary[]): TenantSummary[] {
    return tenants.slice(0, 5);
  }

  licenceBadgeClass(statut: string): string {
    if (statut === 'ACTIVE') return 'badge-active';
    if (statut === 'EXPIREE') return 'badge-expired';
    return 'badge-suspended';
  }
}
