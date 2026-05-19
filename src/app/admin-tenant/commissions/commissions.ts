import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CommissionService } from '../../../core/service/commission.service';
import { CommissionResponse } from '../../../core/model/commission';
import { PageResponse } from '../../../core/model/page-response';

@Component({
  selector: 'app-tenant-commissions',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './commissions.html',
  styleUrl: './commissions.css',
})
export class TenantCommissions implements OnInit {
  private readonly svc = inject(CommissionService);

  page       = signal(0);
  data       = signal<PageResponse<CommissionResponse> | null>(null);
  loading    = signal(true);
  error      = signal<string | null>(null);
  calculating = signal(false);
  calcResult  = signal<string | null>(null);
  versing     = signal<number | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll(this.page()).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => { this.error.set('Erreur de chargement.'); this.loading.set(false); },
    });
  }

  goPage(p: number): void { this.page.set(p); this.load(); }

  calculer(): void {
    this.calculating.set(true);
    this.calcResult.set(null);
    this.svc.calculer().subscribe({
      next: (res) => {
        const count = (res['clientsQualifies'] as number) ?? '?';
        this.calcResult.set(`Calcul terminé : ${count} client(s) qualifié(s).`);
        this.calculating.set(false);
        this.load();
      },
      error: () => { this.calcResult.set('Erreur lors du calcul.'); this.calculating.set(false); },
    });
  }

  verser(id: number): void {
    this.versing.set(id);
    this.svc.verser(id).subscribe({
      next: (updated) => {
        this.data.update((d) => d ? { ...d, contenu: d.contenu.map((c) => c.id === id ? updated : c) } : d);
        this.versing.set(null);
      },
      error: () => this.versing.set(null),
    });
  }

  statutClass(s: string): string {
    const map: Record<string, string> = {
      QUALIFIE: 'badge-green', EN_COURS: 'badge-blue',
      EN_ATTENTE: 'badge-yellow', VERSE: 'badge-purple',
    };
    return map[s] ?? 'badge-gray';
  }

  niveauLabel(n: number): string { return `N${n} (${n === 1 ? '4%' : n === 2 ? '2%' : '1%'})`; }

  get pages(): number[] {
    return Array.from({ length: this.data()?.totalPages ?? 0 }, (_, i) => i);
  }
}
