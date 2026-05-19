import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/service/auth.service';

@Component({
  selector: 'app-vue-login',
  imports: [ReactiveFormsModule],
  templateUrl: './vue-login.html',
  styleUrl: './vue-login.css',
})
export class VueLogin {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  loading      = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => this.authService.redirectByRole(),
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.');
        } else if (err.status === 403 && err.error?.error === 'LICENCE_INACTIVE') {
          this.errorMessage.set('L\'accès à ce tenant est suspendu ou expiré. Contactez le support ASSURIS.');
        } else if (err.status === 0) {
          this.errorMessage.set('Serveur injoignable. Vérifiez votre connexion.');
        } else {
          this.errorMessage.set('Une erreur est survenue. Veuillez réessayer.');
        }
      },
    });
  }

  togglePassword(): void { this.showPassword.update((v) => !v); }

  isInvalid(field: 'username' | 'password'): boolean {
    const c = this.form.controls[field];
    return c.invalid && c.touched;
  }
}
