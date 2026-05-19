import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../core/service/user.service';
import { UserResponse, UserRequest, RoleInterne } from '../../../core/model/user';

@Component({
  selector: 'app-tenant-utilisateurs',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './utilisateurs.html',
  styleUrl: './utilisateurs.css',
})
export class TenantUtilisateurs implements OnInit {
  private readonly svc = inject(UserService);
  private readonly fb  = inject(FormBuilder);

  users   = signal<UserResponse[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);

  /* Drawer création */
  showForm  = signal(false);
  saving    = signal(false);
  saveError = signal<string | null>(null);
  showPwd   = signal(false);

  /* Actions liste */
  actionLoading = signal<number | null>(null);
  actionError   = signal<string | null>(null);

  /* Modal reset MDP */
  resetTarget  = signal<UserResponse | null>(null);
  resetPwd     = signal('');
  resetShowPwd = signal(false);
  resetting    = signal(false);
  resetError   = signal<string | null>(null);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role:     ['AGENT' as RoleInterne, Validators.required],
  });

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (list) => { this.users.set(list); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger les utilisateurs.'); this.loading.set(false); },
    });
  }

  /* ── Création ── */
  openForm(): void {
    this.form.reset({ role: 'AGENT' });
    this.saveError.set(null);
    this.showPwd.set(false);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.saveError.set(null);
    const v = this.form.value;
    const dto: UserRequest = { username: v.username!, password: v.password!, role: v.role as RoleInterne };
    this.svc.create(dto).subscribe({
      next: (created) => {
        this.users.update(list => [created, ...list]);
        this.saving.set(false);
        this.closeForm();
      },
      error: (err) => {
        const msg = err?.status === 409
          ? `L'utilisateur "${dto.username}" existe déjà.`
          : (err?.error?.message ?? 'Erreur lors de la création.');
        this.saveError.set(msg);
        this.saving.set(false);
      },
    });
  }

  /* ── Désactiver / Réactiver ── */
  desactiver(user: UserResponse): void {
    this.actionError.set(null);
    this.actionLoading.set(user.id);
    this.svc.desactiver(user.id).subscribe({
      next: (u) => { this.replaceUser(u); this.actionLoading.set(null); },
      error: (err) => {
        this.actionError.set(err?.error?.message ?? 'Impossible de désactiver cet utilisateur.');
        this.actionLoading.set(null);
      },
    });
  }

  reactiver(user: UserResponse): void {
    this.actionError.set(null);
    this.actionLoading.set(user.id);
    this.svc.reactiver(user.id).subscribe({
      next: (u) => { this.replaceUser(u); this.actionLoading.set(null); },
      error: () => { this.actionError.set('Impossible de réactiver cet utilisateur.'); this.actionLoading.set(null); },
    });
  }

  /* ── Reset mot de passe ── */
  openReset(user: UserResponse): void {
    this.resetTarget.set(user);
    this.resetPwd.set('');
    this.resetShowPwd.set(false);
    this.resetError.set(null);
  }

  closeReset(): void { this.resetTarget.set(null); }

  submitReset(): void {
    const pwd = this.resetPwd();
    if (pwd.length < 8) { this.resetError.set('8 caractères minimum.'); return; }
    const user = this.resetTarget();
    if (!user) return;
    this.resetting.set(true);
    this.resetError.set(null);
    this.svc.resetPassword(user.id, pwd).subscribe({
      next: () => { this.resetting.set(false); this.closeReset(); },
      error: (err) => {
        this.resetError.set(err?.error?.message ?? 'Erreur lors de la réinitialisation.');
        this.resetting.set(false);
      },
    });
  }

  /* ── Helpers ── */
  private replaceUser(updated: UserResponse): void {
    this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
  }

  initiales(username: string): string {
    return username.charAt(0).toUpperCase();
  }

  roleClass(role: string): string {
    return role === 'ADMIN' ? 'role-admin' : 'role-agent';
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c?.invalid && c?.touched);
  }
}
