import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PaiementService } from '../../../core/service/paiement.service';
import { PaiementResponse, PaiementRequest } from '../../../core/model/paiement';

const MODES_PAIEMENT = [
  { value: 'ESPECE',       label: 'Espèces' },
  { value: 'VISA',         label: 'Carte Visa' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'VIREMENT',     label: 'Virement bancaire' },
  { value: 'PAYPAL',       label: 'PayPal' },
  { value: 'WALLET',       label: 'Wallet' },
];

const MODE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  MODES_PAIEMENT.map((m) => [m.value, m.label])
);

@Component({
  selector: 'app-tenant-paiements',
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './paiements.html',
  styleUrl: './paiements.css',
})
export class TenantPaiements implements OnInit {
  private readonly svc = inject(PaiementService);
  private readonly fb  = inject(FormBuilder);

  paiements = signal<PaiementResponse[]>([]);
  loading   = signal(true);
  error     = signal<string | null>(null);
  validating = signal<number | null>(null);

  showForm  = signal(false);
  saving    = signal(false);
  saveError = signal<string | null>(null);

  readonly modes = MODES_PAIEMENT;

  form = this.fb.group({
    policeId:  [null as number | null, Validators.required],
    montant:   [null as number | null, [Validators.required, Validators.min(1)]],
    mode:      ['ESPECE', Validators.required],
    preuveUrl: [''],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (d) => { this.paiements.set(d); this.loading.set(false); },
      error: () => { this.error.set('Erreur de chargement.'); this.loading.set(false); },
    });
  }

  valider(id: number): void {
    this.validating.set(id);
    this.svc.valider(id).subscribe({
      next: (updated) => {
        this.paiements.update((list) => list.map((p) => p.id === id ? updated : p));
        this.validating.set(null);
      },
      error: () => this.validating.set(null),
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.saveError.set(null);
    const v = this.form.value;
    const dto: PaiementRequest = {
      policeId:  v.policeId!,
      montant:   v.montant!,
      mode:      v.mode!,
      preuveUrl: v.preuveUrl || undefined,
    };
    this.svc.create(dto).subscribe({
      next: (created) => {
        this.paiements.update((list) => [created, ...list]);
        this.saving.set(false);
        this.closeForm();
      },
      error: (err) => {
        this.saveError.set(err?.error?.message ?? 'Erreur lors de la création.');
        this.saving.set(false);
      },
    });
  }

  openForm(): void { this.form.reset({ mode: 'ESPECE' }); this.saveError.set(null); this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); }

  modeLabel(mode: string): string { return MODE_LABEL_MAP[mode] ?? mode; }

  statutClass(s: string): string {
    const map: Record<string, string> = {
      EN_ATTENTE: 'badge-yellow', PAYE: 'badge-green', ECHEC: 'badge-red', ANNULE: 'badge-gray',
    };
    return map[s] ?? 'badge-gray';
  }

  isInvalid(n: string): boolean { const c = this.form.get(n); return !!(c?.invalid && c?.touched); }
}
