import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RapportService } from '../../../core/service/rapport.service';

@Component({
  selector: 'app-tenant-rapports',
  imports: [ReactiveFormsModule],
  templateUrl: './rapports.html',
  styleUrl: './rapports.css',
})
export class TenantRapports {
  private readonly svc = inject(RapportService);
  private readonly fb  = inject(FormBuilder);

  downloading = signal<string | null>(null);
  error = signal<string | null>(null);

  readonly currentYear = new Date().getFullYear();
  readonly years = Array.from({ length: 5 }, (_, i) => this.currentYear - i);
  readonly mois  = [
    { val: 1, label: 'Janvier' }, { val: 2, label: 'Février' },
    { val: 3, label: 'Mars' },    { val: 4, label: 'Avril' },
    { val: 5, label: 'Mai' },     { val: 6, label: 'Juin' },
    { val: 7, label: 'Juillet' }, { val: 8, label: 'Août' },
    { val: 9, label: 'Septembre' },{ val: 10, label: 'Octobre' },
    { val: 11, label: 'Novembre' },{ val: 12, label: 'Décembre' },
  ];

  mensuelForm = this.fb.group({
    annee:  [this.currentYear, Validators.required],
    mois:   [new Date().getMonth() + 1, Validators.required],
    format: ['pdf' as 'pdf' | 'excel', Validators.required],
  });

  trimestrielForm = this.fb.group({
    annee:     [this.currentYear, Validators.required],
    trimestre: [Math.ceil((new Date().getMonth() + 1) / 3), Validators.required],
    format:    ['pdf' as 'pdf' | 'excel', Validators.required],
  });

  annuelForm = this.fb.group({
    annee:  [this.currentYear, Validators.required],
    format: ['pdf' as 'pdf' | 'excel', Validators.required],
  });

  downloadMensuel(): void {
    if (this.mensuelForm.invalid) return;
    const v = this.mensuelForm.value;
    this.download('mensuel', this.svc.mensuel(v.annee!, v.mois!, v.format!));
  }

  downloadTrimestriel(): void {
    if (this.trimestrielForm.invalid) return;
    const v = this.trimestrielForm.value;
    this.download('trimestriel', this.svc.trimestriel(v.annee!, v.trimestre!, v.format!));
  }

  downloadAnnuel(): void {
    if (this.annuelForm.invalid) return;
    const v = this.annuelForm.value;
    this.download('annuel', this.svc.annuel(v.annee!, v.format!));
  }

  private download(key: string, obs: ReturnType<typeof this.svc.annuel>): void {
    this.downloading.set(key);
    this.error.set(null);
    obs.subscribe({
      next: (blob) => {
        const form = key === 'mensuel' ? this.mensuelForm : key === 'trimestriel' ? this.trimestrielForm : this.annuelForm;
        const fmt = form.value.format ?? 'pdf';
        const ext = fmt === 'excel' ? 'xlsx' : 'pdf';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-${key}-${new Date().getFullYear()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        this.downloading.set(null);
      },
      error: () => { this.error.set('Erreur lors du téléchargement.'); this.downloading.set(null); },
    });
  }
}
