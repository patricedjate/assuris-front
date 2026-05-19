import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientMeService } from '../../../core/service/client-me.service';
import { PaiementService } from '../../../core/service/paiement.service';
import { PoliceResponse } from '../../../core/model/police';

const TYPES_POLICE = [
  { value: 'RC',           label: 'Responsabilité Civile (RC)' },
  { value: 'RC_PLUS',      label: 'RC Plus' },
  { value: 'TOUS_RISQUES', label: 'Tous Risques' },
];

const MODES_PAIEMENT = [
  { value: 'ESPECE',       label: 'Espèces' },
  { value: 'VISA',         label: 'Carte Visa' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'VIREMENT',     label: 'Virement bancaire' },
  { value: 'PAYPAL',       label: 'PayPal' },
  { value: 'WALLET',       label: 'Wallet' },
];

const POLICE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  TYPES_POLICE.map((t) => [t.value, t.label])
);

@Component({
  selector: 'app-client-police',
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './police.html',
  styleUrl: './police.css',
})
export class ClientPolice implements OnInit {
  private readonly meService      = inject(ClientMeService);
  private readonly paiementService = inject(PaiementService);
  private readonly fb              = inject(FormBuilder);

  police                   = signal<PoliceResponse | null>(null);
  loading                  = signal(true);
  downloadingAttestation   = signal(false);
  downloadingCarteVerte    = signal(false);
  downloadingRecu          = signal(false);
  renewalLoading           = signal(false);
  renewalSuccess           = signal(false);

  paying     = signal(false);
  paySuccess = signal(false);
  payError   = signal<string | null>(null);

  readonly typesPolice   = TYPES_POLICE;
  readonly modesPaiement = MODES_PAIEMENT;

  payForm = this.fb.group({
    typePolice: ['', Validators.required],
    mode:       ['MOBILE_MONEY', Validators.required],
    preuveUrl:  [''],
  });

  ngOnInit(): void {
    this.meService.maPolice().subscribe({
      next: (p) => {
        this.police.set(p);
        this.payForm.patchValue({ typePolice: p.typePolice });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private isExpiredLocally(): boolean {
    const p = this.police();
    if (!p) return false;
    const fin = new Date(p.dateExpiration);
    fin.setHours(23, 59, 59, 999);
    return fin < new Date();
  }

  get effectiveStatut(): string {
    if (this.isExpiredLocally() && this.police()?.statut === 'ACTIF') return 'EXPIRE';
    return this.police()?.statut ?? '';
  }

  get statutClass(): string {
    const s = this.effectiveStatut;
    if (s === 'ACTIF') return 'badge-success';
    if (s === 'EN_ATTENTE') return 'badge-warning';
    if (s === 'EXPIRE' || s === 'RESILIE') return 'badge-danger';
    if (s === 'SUSPENDU') return 'badge-orange';
    return 'badge-secondary';
  }

  get needsPayment(): boolean {
    const s = this.police()?.statut;
    return s === 'EXPIRE' || s === 'EN_ATTENTE' || (s === 'ACTIF' && this.isExpiredLocally());
  }

  policeTypeLabel(code: string): string {
    return POLICE_LABEL_MAP[code] ?? code;
  }

  demanderRenouvellement(): void {
    this.renewalLoading.set(true);
    this.meService.demanderRenouvellement().subscribe({
      next: (p) => {
        this.police.set(p);
        this.renewalSuccess.set(true);
        this.renewalLoading.set(false);
        this.payForm.patchValue({ typePolice: p.typePolice });
      },
      error: () => this.renewalLoading.set(false),
    });
  }

  submitPaiement(): void {
    if (this.payForm.invalid) { this.payForm.markAllAsTouched(); return; }
    const p = this.police();
    if (!p) return;
    this.paying.set(true);
    this.payError.set(null);
    const v = this.payForm.value;
    this.paiementService.create({
      policeId: p.id,
      montant: p.prime,
      mode: v.mode!,
      preuveUrl: v.preuveUrl || undefined,
      nouveauTypePolice: v.typePolice !== p.typePolice ? v.typePolice! : undefined,
    }).subscribe({
      next: () => {
        this.paying.set(false);
        this.paySuccess.set(true);
        this.payForm.reset({ mode: 'MOBILE_MONEY', typePolice: p.typePolice });
      },
      error: (err) => {
        this.payError.set(err?.error?.message ?? 'Erreur lors du paiement. Veuillez réessayer.');
        this.paying.set(false);
      },
    });
  }

  downloadAttestation(): void {
    this.downloadingAttestation.set(true);
    this.meService.downloadAttestation().subscribe({
      next: (blob) => { this.triggerDownload(blob, `attestation-${this.police()?.reference}.pdf`); this.downloadingAttestation.set(false); },
      error: () => this.downloadingAttestation.set(false),
    });
  }

  downloadCarteVerte(): void {
    this.downloadingCarteVerte.set(true);
    this.meService.downloadCarteVerte().subscribe({
      next: (blob) => { this.triggerDownload(blob, `carte-verte-${this.police()?.reference}.pdf`); this.downloadingCarteVerte.set(false); },
      error: () => this.downloadingCarteVerte.set(false),
    });
  }

  downloadRecu(): void {
    this.downloadingRecu.set(true);
    this.meService.downloadRecu().subscribe({
      next: (blob) => { this.triggerDownload(blob, `recu-${this.police()?.reference}.pdf`); this.downloadingRecu.set(false); },
      error: () => this.downloadingRecu.set(false),
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
}
