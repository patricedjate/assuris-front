import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ClientMeService } from '../../../core/service/client-me.service';
import { SinistreResponse } from '../../../core/model/sinistre';
import { DeclarerModal } from './declarer-modal/declarer-modal';

@Component({
  selector: 'app-client-sinistres',
  imports: [DatePipe, DeclarerModal],
  templateUrl: './sinistres.html',
  styleUrl: './sinistres.css',
})
export class ClientSinistres implements OnInit {
  private readonly meService = inject(ClientMeService);

  sinistres = signal<SinistreResponse[]>([]);
  loading = signal(true);
  showDeclarer = signal(false);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.meService.mesSinistres().subscribe({
      next: (data) => { this.sinistres.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onDeclarerClosed(saved: boolean): void {
    this.showDeclarer.set(false);
    if (saved) this.load();
  }

  statutClass(statut: string): string {
    const map: Record<string, string> = {
      OUVERT: 'st-orange', COMPLET: 'st-blue', EN_INSTRUCTION: 'st-blue',
      ACCEPTE: 'st-green', REGLE: 'st-green', REJETE: 'st-red',
    };
    return map[statut] ?? 'st-gray';
  }
}
