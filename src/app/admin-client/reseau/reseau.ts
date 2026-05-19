import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ClientMeService } from '../../../core/service/client-me.service';
import { ReseauResponse, FilleulDetail } from '../../../core/model/reseau';

@Component({
  selector: 'app-client-reseau',
  imports: [DatePipe],
  templateUrl: './reseau.html',
  styleUrl: './reseau.css',
})
export class ClientReseau implements OnInit {
  private readonly meService = inject(ClientMeService);

  reseau = signal<ReseauResponse | null>(null);
  loading = signal(true);
  niveauOuvert = signal<number | null>(null);

  ngOnInit(): void {
    this.meService.monReseau().subscribe({
      next: (r) => { this.reseau.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  progression(actif: number): number {
    return Math.min((actif / 3) * 100, 100);
  }

  toggleNiveau(n: number): void {
    this.niveauOuvert.update(current => current === n ? null : n);
  }

  filleuls(n: number): FilleulDetail[] {
    const r = this.reseau();
    if (!r) return [];
    if (n === 1) return r.filleulsN1 ?? [];
    if (n === 2) return r.filleulsN2 ?? [];
    return r.filleulsN3 ?? [];
  }

  statutFilleulClass(statut: string): string {
    if (statut === 'ACTIF') return 'sf-actif';
    if (statut === 'EN_ATTENTE') return 'sf-attente';
    if (statut === 'EXPIRE') return 'sf-expire';
    return 'sf-autre';
  }
}
