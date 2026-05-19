import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientMeService } from '../../../core/service/client-me.service';
import { CommissionResponse } from '../../../core/model/commission';

const OPERATEURS = [
  { value: 'MTN_MONEY',    label: 'MTN Money' },
  { value: 'ORANGE_MONEY', label: 'Orange Money' },
  { value: 'WAVE',         label: 'Wave' },
];

@Component({
  selector: 'app-client-commissions',
  imports: [DatePipe, DecimalPipe, FormsModule],
  templateUrl: './commissions.html',
  styleUrl: './commissions.css',
})
export class ClientCommissions implements OnInit {
  private readonly meService = inject(ClientMeService);

  commissions    = signal<CommissionResponse[]>([]);
  loading        = signal(true);
  operateur      = signal('MTN_MONEY');
  virementEnCours = signal<number | null>(null);
  virementSuccess = signal<number | null>(null);
  virementError   = signal<string | null>(null);

  readonly operateurs = OPERATEURS;

  ngOnInit(): void {
    this.meService.mesCommissions().subscribe({
      next: (data) => { this.commissions.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  get total(): number {
    return this.commissions()
      .filter((c) => c.statut === 'VERSE')
      .reduce((sum, c) => sum + c.montant, 0);
  }

  get enAttente(): number {
    return this.commissions()
      .filter((c) => c.statut !== 'VERSE')
      .reduce((sum, c) => sum + c.montant, 0);
  }

  demanderMobileMoney(id: number): void {
    this.virementEnCours.set(id);
    this.virementError.set(null);
    this.meService.demanderMobileMoney(id, this.operateur()).subscribe({
      next: (updated) => {
        this.commissions.update(list => list.map(c => c.id === id ? updated : c));
        this.virementEnCours.set(null);
        this.virementSuccess.set(id);
        setTimeout(() => this.virementSuccess.set(null), 4000);
      },
      error: (err) => {
        this.virementError.set(err?.error?.message ?? 'Erreur lors de la demande.');
        this.virementEnCours.set(null);
      },
    });
  }

  statutClass(statut: string): string {
    if (statut === 'VERSE') return 'st-green';
    if (statut === 'QUALIFIE' || statut === 'EN_COURS') return 'st-blue';
    return 'st-gray';
  }

  niveauLabel(n: number): string {
    return `N${n} (${n === 1 ? '4%' : n === 2 ? '2%' : '1%'})`;
  }
}
