import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ClientMeService } from '../../../core/service/client-me.service';
import { ClientDashboard as ClientDashboardModel } from '../../../core/model/client';

@Component({
  selector: 'app-client-dashboard',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardPage implements OnInit {
  private readonly meService = inject(ClientMeService);

  data = signal<ClientDashboardModel | null>(null);
  loading = signal(true);
  copie = signal(false);

  ngOnInit(): void {
    this.meService.dashboard().subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  private isPoliceExpiredLocally(): boolean {
    const p = this.data()?.police;
    if (!p) return false;
    const fin = new Date(p.dateExpiration);
    fin.setHours(23, 59, 59, 999);
    return fin < new Date();
  }

  get badgePoliceEffectif(): string {
    if (this.isPoliceExpiredLocally()) return 'EXPIRE';
    return this.data()?.badgePolice ?? '';
  }

  get badgeClass(): string {
    const b = this.badgePoliceEffectif;
    if (b === 'VALIDE') return 'badge-success';
    if (b === 'EXPIRATION_PROCHE') return 'badge-warning';
    if (b === 'EXPIRE' || b === 'AUCUNE') return 'badge-danger';
    return 'badge-secondary';
  }

  get qualifClass(): string {
    const q = this.data()?.statutQualification;
    if (q === 'QUALIFIE') return 'badge-success';
    if (q === 'EN_COURS') return 'badge-warning';
    return 'badge-secondary';
  }

  get validitePercent(): number {
    const p = this.data()?.police;
    if (!p || !p.dateEffet || !p.dateExpiration) return 0;
    const debut = new Date(p.dateEffet).getTime();
    const fin = new Date(p.dateExpiration).getTime();
    const now = Date.now();
    if (now >= fin) return 0;
    if (now <= debut) return 100;
    return Math.round(((fin - now) / (fin - debut)) * 100);
  }

  get jourRestants(): number {
    const p = this.data()?.police;
    if (!p) return 0;
    const diff = new Date(p.dateExpiration).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  get validiteColor(): string {
    const pct = this.validitePercent;
    if (pct > 50) return '#2e7d32';
    if (pct > 20) return '#f57c00';
    return '#c62828';
  }

  get whatsappUrl(): string {
    const code = this.data()?.codeParrainage ?? '';
    const msg = encodeURIComponent(
      `Bonjour ! Rejoignez Assuris avec mon code de parrainage ${code} et bénéficiez d'une assurance à partir de 20 000 FCFA/an. Inscrivez-vous dès maintenant !`
    );
    return `https://api.whatsapp.com/send?text=${msg}`;
  }

  get smsUrl(): string {
    const code = this.data()?.codeParrainage ?? '';
    const msg = encodeURIComponent(
      `Rejoignez Assuris avec mon code ${code} — assurance moto à partir de 20 000 FCFA/an.`
    );
    return `sms:?body=${msg}`;
  }

  copierCode(): void {
    const code = this.data()?.codeParrainage;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      this.copie.set(true);
      setTimeout(() => this.copie.set(false), 2500);
    });
  }
}
