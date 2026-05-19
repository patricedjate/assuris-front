import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientMeService } from '../../../core/service/client-me.service';

@Component({
  selector: 'app-client-profil',
  imports: [ReactiveFormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class ClientProfil {
  private readonly fb = inject(FormBuilder);
  private readonly meService = inject(ClientMeService);

  loading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  form = this.fb.nonNullable.group({
    ancienMdp: ['', Validators.required],
    nouveauMdp: ['', [Validators.required, Validators.minLength(6)]],
    confirmMdp: ['', Validators.required],
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { ancienMdp, nouveauMdp, confirmMdp } = this.form.getRawValue();
    if (nouveauMdp !== confirmMdp) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.loading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.meService.changerMotDePasse(ancienMdp, nouveauMdp).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Mot de passe modifié avec succès.');
        this.form.reset();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Ancien mot de passe incorrect.');
      },
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!c && c.invalid && c.touched;
  }
}
