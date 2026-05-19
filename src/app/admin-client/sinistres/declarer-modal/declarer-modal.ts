import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { ClientMeService } from '../../../../core/service/client-me.service';
import { PoliceResponse } from '../../../../core/model/police';

@Component({
  selector: 'app-declarer-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './declarer-modal.html',
  styleUrl: './declarer-modal.css',
})
export class DeclarerModal implements OnInit {
  closed = output<boolean>();

  private readonly fb = inject(FormBuilder);
  private readonly meService = inject(ClientMeService);

  step = signal<1 | 2 | 3>(1);
  loading = signal(false);
  cimaError = signal<string | null>(null);
  errorMessage = signal('');
  police = signal<PoliceResponse | null>(null);
  fichiers = signal<File[]>([]);

  step1 = this.fb.nonNullable.group({
    dateSinistre: ['', Validators.required],
    heureSinistre: ['', Validators.required],
    lieu: ['', Validators.required],
  });

  step2 = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.minLength(10)]],
    avecBlesses: [false],
  });

  ngOnInit(): void {
    this.meService.maPolice().subscribe({
      next: (p) => this.police.set(p),
      error: () => this.errorMessage.set('Impossible de récupérer votre police.'),
    });
  }

  goStep2(): void {
    this.step1.markAllAsTouched();
    if (this.step1.invalid) return;

    const date = new Date(this.step1.value.dateSinistre!);
    const today = new Date();

    if (isNaN(date.getTime())) {
      this.cimaError.set('Date invalide.');
      return;
    }

    if (date > today) {
      this.cimaError.set('La date du sinistre ne peut pas être dans le futur.');
      return;
    }

    const p = this.police();
    if (p) {
      const effet = new Date(p.dateEffet);
      const expiration = new Date(p.dateExpiration);
      if (date < effet || date > expiration) {
        this.cimaError.set(
          `Votre police n'était pas active à cette date (période : ${effet.toLocaleDateString('fr-FR')} → ${expiration.toLocaleDateString('fr-FR')}).`
        );
        return;
      }
    }

    const joursEcoules = this.joursOuvrables(date, today);
    if (joursEcoules > 5) {
      this.cimaError.set(
        `Délai CIMA dépassé : ${joursEcoules} jours ouvrables depuis le sinistre. La déclaration doit intervenir dans les 5 jours ouvrables (Article 12 CIMA).`
      );
      return;
    }

    this.cimaError.set(null);
    this.step.set(2);
  }

  goStep3(): void {
    this.step2.markAllAsTouched();
    if (this.step2.invalid) return;
    this.step.set(3);
  }

  goBack(s: 1 | 2): void {
    this.cimaError.set(null);
    this.step.set(s);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.fichiers.update(existing => [...existing, ...Array.from(input.files!)]);
    input.value = '';
  }

  removeFile(index: number): void {
    this.fichiers.update(files => files.filter((_, i) => i !== index));
  }

  formatSize(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} Ko`
      : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  submit(): void {
    const p = this.police();
    if (!p) return;

    this.loading.set(true);
    this.errorMessage.set('');
    const v1 = this.step1.getRawValue();
    const v2 = this.step2.getRawValue();

    this.meService.declarerSinistre({
      policeId: p.id,
      dateSinistre: v1.dateSinistre,
      heure: v1.heureSinistre,
      lieu: v1.lieu,
      description: v2.description,
      avecBlesses: v2.avecBlesses,
    }).pipe(
      switchMap((sinistre) => {
        const files = this.fichiers();
        return files.length > 0
          ? this.meService.uploadDocuments(sinistre.id, files)
          : of(null);
      })
    ).subscribe({
      next: () => this.closed.emit(true),
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Une erreur est survenue.');
      },
    });
  }

  close(): void { this.closed.emit(false); }

  isInvalid1(field: string): boolean {
    const c = this.step1.get(field);
    return !!c && c.invalid && c.touched;
  }

  isInvalid2(field: string): boolean {
    const c = this.step2.get(field);
    return !!c && c.invalid && c.touched;
  }

  private joursOuvrables(debut: Date, fin: Date): number {
    let count = 0;
    const d = new Date(debut);
    d.setHours(0, 0, 0, 0);
    const end = new Date(fin);
    end.setHours(0, 0, 0, 0);
    while (d < end) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day !== 0 && day !== 6) count++;
    }
    return count;
  }
}
