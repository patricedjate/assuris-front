import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SuperAdminService } from '../../../core/service/super-admin.service';
import { TenantSummary } from '../../../core/model/super-admin';

@Component({
  selector: 'app-tenant-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './tenant-detail.html',
  styleUrl: './tenant-detail.css',
})
export class TenantDetail implements OnInit {
  private readonly svc    = inject(SuperAdminService);
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);

  tenant        = signal<TenantSummary | null>(null);
  loading       = signal(true);
  error         = signal<string | null>(null);
  actionLoading = signal<string | null>(null);
  actionError   = signal<string | null>(null);
  actionSuccess = signal<string | null>(null);
  showDeleteConfirm = signal(false);

  private get tenantId(): string {
    return this.route.snapshot.paramMap.get('tenantId') ?? '';
  }

  ngOnInit(): void {
    this.svc.getTenant(this.tenantId).subscribe({
      next:  (t) => { this.tenant.set(t); this.loading.set(false); },
      error: ()  => { this.error.set('Tenant introuvable.'); this.loading.set(false); },
    });
  }

  renouveler(): void {
    this.runAction('renouveler', () => this.svc.renouvelerLicence(this.tenantId),
      'Licence renouvelée d\'un an avec succès.');
  }

  suspendre(): void {
    this.runAction('suspendre', () => this.svc.suspendreLicence(this.tenantId),
      'Licence suspendue. L\'accès au tenant est bloqué immédiatement.');
  }

  reactiver(): void {
    this.runAction('reactiver', () => this.svc.reactiverLicence(this.tenantId),
      'Licence réactivée avec succès.');
  }

  private runAction(
    key: string,
    call: () => ReturnType<SuperAdminService['renouvelerLicence']>,
    successMsg: string,
  ): void {
    this.actionLoading.set(key);
    this.actionError.set(null);
    this.actionSuccess.set(null);
    call().subscribe({
      next: (licence) => {
        this.tenant.update((t) => (t ? { ...t, licence } : t));
        this.actionSuccess.set(successMsg);
        this.actionLoading.set(null);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? 'Une erreur est survenue.');
        this.actionLoading.set(null);
      },
    });
  }

  askDelete(): void { this.showDeleteConfirm.set(true); }
  cancelDelete(): void { this.showDeleteConfirm.set(false); }

  confirmDelete(): void {
    this.actionLoading.set('delete');
    this.svc.deleteTenant(this.tenantId).subscribe({
      next:  () => this.router.navigate(['/admin-saas/tenants']),
      error: () => {
        this.actionError.set('Erreur lors de la suppression.');
        this.actionLoading.set(null);
        this.showDeleteConfirm.set(false);
      },
    });
  }

  licenceBadgeClass(statut: string): string {
    if (statut === 'ACTIVE')   return 'badge-active';
    if (statut === 'EXPIREE')  return 'badge-expired';
    return 'badge-suspended';
  }

  licenceIcon(statut: string): string {
    if (statut === 'ACTIVE')   return 'fa-check-circle';
    if (statut === 'EXPIREE')  return 'fa-times-circle';
    return 'fa-pause-circle';
  }

  licenceLabel(statut: string): string {
    if (statut === 'ACTIVE')   return 'Active';
    if (statut === 'EXPIREE')  return 'Expirée';
    return 'Suspendue';
  }

  progressWidth(joursRestants: number): number {
    return Math.round(Math.min(100, Math.max(0, (joursRestants / 365) * 100)));
  }

  progressClass(joursRestants: number): string {
    if (joursRestants > 90)  return 'progress-ok';
    if (joursRestants > 30)  return 'progress-warn';
    return 'progress-danger';
  }
}
