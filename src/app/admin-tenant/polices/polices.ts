import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PoliceService } from '../../../core/service/police.service';
import { PoliceResponse } from '../../../core/model/police';
import { PageResponse } from '../../../core/model/page-response';

@Component({
  selector: 'app-tenant-polices',
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './polices.html',
  styleUrl: './polices.css',
})
export class TenantPolices implements OnInit {
  private readonly svc = inject(PoliceService);
  private readonly fb  = inject(FormBuilder);

  page  = signal(0);
  data  = signal<PageResponse<PoliceResponse> | null>(null);
  loading = signal(true);
  error   = signal<string | null>(null);

  actionLoading = signal<number | null>(null);

  showRenewForm = signal<number | null>(null);
  renewForm = this.fb.group({ nouvelleExpiration: ['', Validators.required] });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll(this.page()).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => { this.error.set('Erreur de chargement.'); this.loading.set(false); },
    });
  }

  goPage(p: number): void { this.page.set(p); this.load(); }

  activer(id: number): void { this.doAction(id, this.svc.activer(id)); }
  suspendre(id: number): void { this.doAction(id, this.svc.suspendre(id)); }
  resilier(id: number): void { this.doAction(id, this.svc.resilier(id)); }

  openRenew(id: number): void {
    this.renewForm.reset();
    this.showRenewForm.set(id);
  }

  submitRenew(): void {
    const id = this.showRenewForm();
    if (id === null || this.renewForm.invalid) return;
    const date = this.renewForm.value.nouvelleExpiration!;
    this.doAction(id, this.svc.renouveler(id, date));
    this.showRenewForm.set(null);
  }

  private doAction(id: number, obs: ReturnType<typeof this.svc.activer>): void {
    this.actionLoading.set(id);
    obs.subscribe({
      next: (updated) => {
        this.data.update((d) => {
          if (!d) return d;
          return { ...d, contenu: d.contenu.map((p) => (p.id === id ? updated : p)) };
        });
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  statutClass(s: string): string {
    const map: Record<string, string> = {
      ACTIF: 'badge-green', EN_ATTENTE: 'badge-yellow',
      EXPIRE: 'badge-gray', SUSPENDU: 'badge-orange',
      RESILIE: 'badge-red', ARCHIVE: 'badge-gray',
    };
    return map[s] ?? 'badge-gray';
  }

  get pages(): number[] {
    return Array.from({ length: this.data()?.totalPages ?? 0 }, (_, i) => i);
  }
}
