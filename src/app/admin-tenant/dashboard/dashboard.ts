import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/service/auth.service';
import { TenantConfigService } from '../../../core/service/tenant-config.service';
import { PoliceService } from '../../../core/service/police.service';
import { SinistreService } from '../../../core/service/sinistre.service';
import { PaiementService } from '../../../core/service/paiement.service';
import { AdminKpis, AlerteDTO } from '../../../core/model/tenant-config';
import { PoliceResponse } from '../../../core/model/police';
import { SinistreResponse } from '../../../core/model/sinistre';
import { PaiementResponse } from '../../../core/model/paiement';

const P_STATUT_CLASS: Record<string, string> = {
  ACTIF: 'p-actif', EN_ATTENTE: 'p-attente', EXPIRE: 'p-expire',
  SUSPENDU: 'p-suspendu', RESILIE: 'p-resilie', ARCHIVE: 'p-archive',
};
const S_STATUT_CLASS: Record<string, string> = {
  OUVERT: 's-ouvert', COMPLET: 's-complet', EN_INSTRUCTION: 's-instruction',
  ACCEPTE: 's-accepte', REGLE: 's-regle', REJETE: 's-rejete',
};

@Component({
  selector: 'app-tenant-dashboard',
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class TenantDashboard implements OnInit {
  private readonly auth        = inject(AuthService);
  private readonly configSvc   = inject(TenantConfigService);
  private readonly policeSvc   = inject(PoliceService);
  private readonly sinistreSvc = inject(SinistreService);
  private readonly paiementSvc = inject(PaiementService);

  get isAgent(): boolean { return this.auth.getRole() === 'AGENT'; }
  get today(): Date      { return new Date(); }

  /* ── ADMIN : KPIs ── */
  kpis        = signal<AdminKpis | null>(null);
  kpisLoading = signal(false);
  kpisError   = signal<string | null>(null);
  periode     = signal('MOIS');

  readonly periodes = [
    { value: 'MOIS',   label: 'Ce mois' },
    { value: 'Q1',     label: '1er trim.' },
    { value: 'Q2',     label: '2e trim.' },
    { value: 'Q3',     label: '3e trim.' },
    { value: 'Q4',     label: '4e trim.' },
    { value: 'ANNUEL', label: 'Cette année' },
  ];

  /* ── ADMIN : alertes ── */
  alertes       = signal<AlerteDTO[]>([]);
  alertesLoading = signal(false);
  lancerLoading  = signal(false);
  lancerSuccess  = signal<string | null>(null);

  /* ── Commun : polices expirant / sinistres ── */
  policesExpirant  = signal<PoliceResponse[]>([]);
  sinistresRecents = signal<SinistreResponse[]>([]);

  /* ── AGENT : polices EN_ATTENTE ── */
  policesEnAttente   = signal<PoliceResponse[]>([]);
  activatingPolice   = signal<number | null>(null);

  /* ── AGENT : paiements EN_ATTENTE ── */
  paiementsEnAttente = signal<PaiementResponse[]>([]);
  validatingPaiement = signal<number | null>(null);

  /* Chargement global sections */
  sectionsLoading = signal(false);
  actionError     = signal<string | null>(null);

  /* ════════════════════════════════════
     Cycle de vie
  ════════════════════════════════════ */
  ngOnInit(): void {
    if (this.isAgent) {
      this.loadAgentData();
    } else {
      this.loadKpis();
      this.loadAlertes();
      this.loadAdminSections();
    }
  }

  /* ── ADMIN ── */
  loadKpis(): void {
    this.kpisLoading.set(true);
    this.configSvc.getKpis(this.periode()).subscribe({
      next: (d) => { this.kpis.set(d); this.kpisLoading.set(false); },
      error: () => { this.kpisError.set('Impossible de charger les KPIs.'); this.kpisLoading.set(false); },
    });
  }

  changePeriode(p: string): void { this.periode.set(p); this.loadKpis(); }

  loadAlertes(): void {
    this.alertesLoading.set(true);
    this.configSvc.getDashboardAlertes().subscribe({
      next: (d) => { this.alertes.set(d); this.alertesLoading.set(false); },
      error: () => this.alertesLoading.set(false),
    });
  }

  lancerAlertes(): void {
    this.lancerLoading.set(true);
    this.lancerSuccess.set(null);
    this.configSvc.lancerAlertes().subscribe({
      next: () => {
        this.lancerSuccess.set('Alertes de renouvellement envoyées.');
        this.lancerLoading.set(false);
        this.loadAlertes();
      },
      error: () => this.lancerLoading.set(false),
    });
  }

  private loadAdminSections(): void {
    this.sectionsLoading.set(true);
    forkJoin({
      expirant:  this.policeSvc.getExpirant(),
      sinistres: this.sinistreSvc.getAll(0, 8),
    }).subscribe({
      next: ({ expirant, sinistres }) => {
        this.policesExpirant.set(expirant.slice(0, 7));
        this.sinistresRecents.set(
          sinistres.contenu
            .filter(s => ['OUVERT', 'COMPLET', 'EN_INSTRUCTION'].includes(s.statut))
            .slice(0, 7)
        );
        this.sectionsLoading.set(false);
      },
      error: () => this.sectionsLoading.set(false),
    });
  }

  /* ── AGENT ── */
  private loadAgentData(): void {
    this.sectionsLoading.set(true);
    forkJoin({
      polices:   this.policeSvc.getAll(0, 20),
      expirant:  this.policeSvc.getExpirant(),
      sinistres: this.sinistreSvc.getAll(0, 10),
      paiements: this.paiementSvc.getAll(),
    }).subscribe({
      next: ({ polices, expirant, sinistres, paiements }) => {
        this.policesEnAttente.set(
          polices.contenu.filter(p => p.statut === 'EN_ATTENTE').slice(0, 7)
        );
        this.policesExpirant.set(expirant.slice(0, 7));
        this.sinistresRecents.set(
          sinistres.contenu
            .filter(s => ['OUVERT', 'COMPLET'].includes(s.statut))
            .slice(0, 7)
        );
        this.paiementsEnAttente.set(
          paiements.filter(p => p.statut === 'EN_ATTENTE').slice(0, 7)
        );
        this.sectionsLoading.set(false);
      },
      error: () => this.sectionsLoading.set(false),
    });
  }

  activerPolice(id: number): void {
    this.actionError.set(null);
    this.activatingPolice.set(id);
    this.policeSvc.activer(id).subscribe({
      next: () => {
        this.policesEnAttente.update(list => list.filter(p => p.id !== id));
        this.activatingPolice.set(null);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? 'Erreur lors de l\'activation.');
        this.activatingPolice.set(null);
      },
    });
  }

  validerPaiement(id: number): void {
    this.actionError.set(null);
    this.validatingPaiement.set(id);
    this.paiementSvc.valider(id).subscribe({
      next: () => {
        this.paiementsEnAttente.update(list => list.filter(p => p.id !== id));
        this.validatingPaiement.set(null);
      },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? 'Erreur lors de la validation.');
        this.validatingPaiement.set(null);
      },
    });
  }

  /* ── Helpers ── */
  formatXof(v: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'XOF', minimumFractionDigits: 0,
    }).format(v);
  }

  joursRestants(dateExpiration: string): number {
    return Math.max(0, Math.ceil((new Date(dateExpiration).getTime() - Date.now()) / 86400000));
  }

  joursClass(jours: number): string {
    if (jours <= 7)  return 'jours-critical';
    if (jours <= 15) return 'jours-warn';
    return 'jours-ok';
  }

  modeLabel(mode: string): string {
    const map: Record<string, string> = {
      ESPECE: 'Espèces', VISA: 'Visa', MOBILE_MONEY: 'Mobile Money',
      VIREMENT: 'Virement', PAYPAL: 'PayPal', WALLET: 'Wallet',
    };
    return map[mode] ?? mode;
  }

  policeStatutClass(s: string): string { return P_STATUT_CLASS[s] ?? 'p-archive'; }
  sinistreStatutClass(s: string): string { return S_STATUT_CLASS[s] ?? 's-ouvert'; }

  alerteClass(type: string): string {
    const map: Record<string, string> = {
      URGENT: 'alerte-urgent', AVERTISSEMENT: 'alerte-warn',
      INFO: 'alerte-info', SUCCES: 'alerte-success',
    };
    return map[type] ?? 'alerte-info';
  }

  alerteIcon(type: string): string {
    const map: Record<string, string> = {
      URGENT: 'fa-exclamation-triangle', AVERTISSEMENT: 'fa-exclamation-circle',
      INFO: 'fa-info-circle', SUCCES: 'fa-check-circle',
    };
    return map[type] ?? 'fa-info-circle';
  }
}
