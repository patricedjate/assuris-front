import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SuperAdminService } from '../../../core/service/super-admin.service';
import { TenantSummary, TenantProvisioningRequest, ParametreTarifaire } from '../../../core/model/super-admin';

const TYPES_VEHICULE = [
  { value: 'MOTO',                   label: 'Moto / Cyclomoteur' },
  { value: 'PARTICULIER',            label: 'Véhicule de tourisme' },
  { value: 'TAXI',                   label: 'Taxi / VTC' },
  { value: 'MINIBUS',                label: 'Minibus / GBAKA' },
  { value: 'FLOTTE_PROFESSIONNELLE', label: 'Flotte professionnelle' },
];

const TYPES_POLICE = [
  { value: 'RC',           label: 'Responsabilité Civile (RC)' },
  { value: 'RC_PLUS',      label: 'RC Plus' },
  { value: 'TOUS_RISQUES', label: 'Tous Risques' },
];

@Component({
  selector: 'app-admin-tenants',
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe, RouterLink],
  templateUrl: './tenants.html',
  styleUrl: './tenants.css',
})
export class AdminTenants implements OnInit {
  private readonly svc = inject(SuperAdminService);
  private readonly fb = inject(FormBuilder);

  tenants = signal<TenantSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);
  saveError = signal<string | null>(null);
  showForm = signal(false);
  confirmDeleteId = signal<string | null>(null);
  deleting = signal(false);

  readonly typesVehicule = TYPES_VEHICULE;
  readonly typesPolice = TYPES_POLICE;

  form: FormGroup = this.fb.group({
    tenantId:         ['', [Validators.required, Validators.pattern(/^[a-z0-9_-]{3,30}$/)]],
    adminUsername:    ['', [Validators.required, Validators.email]],
    adminPassword:    ['', [Validators.required, Validators.minLength(8)]],
    nomCompagnie:     ['', Validators.required],
    contactTelephone: [''],
    contactEmail:     ['', Validators.email],
    adresse:          [''],
    siteWeb:          [''],
    couleurPrimaire:  ['#1565c0'],
    parametresTarifaires: this.fb.array([]),
  });

  get tarifs(): FormArray { return this.form.get('parametresTarifaires') as FormArray; }

  ngOnInit(): void { this.loadTenants(); }

  private loadTenants(): void {
    this.loading.set(true);
    this.svc.getTenants().subscribe({
      next: (data) => { this.tenants.set(data); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger les tenants.'); this.loading.set(false); },
    });
  }

  openForm(): void {
    this.form.reset({ couleurPrimaire: '#1565c0' });
    this.tarifs.clear();
    this.addTarif();
    this.saveError.set(null);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  addTarif(): void {
    this.tarifs.push(this.fb.group({
      typeVehicule: ['MOTO', Validators.required],
      typePolice:   ['RC',   Validators.required],
      primeMin:     [20000,  [Validators.required, Validators.min(1)]],
      primeMax:     [20000,  [Validators.required, Validators.min(1)]],
    }));
  }

  removeTarif(i: number): void {
    if (this.tarifs.length > 1) this.tarifs.removeAt(i);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.saveError.set(null);

    const v = this.form.value;
    const dto: TenantProvisioningRequest = {
      tenantId:         v.tenantId,
      adminUsername:    v.adminUsername,
      adminPassword:    v.adminPassword,
      nomCompagnie:     v.nomCompagnie,
      contactTelephone: v.contactTelephone || undefined,
      contactEmail:     v.contactEmail || undefined,
      adresse:          v.adresse || undefined,
      siteWeb:          v.siteWeb || undefined,
      couleurPrimaire:  v.couleurPrimaire || undefined,
      parametresTarifaires: v.parametresTarifaires as ParametreTarifaire[],
    };

    this.svc.provisionTenant(dto).subscribe({
      next: (created) => {
        this.tenants.update((list) => [created, ...list]);
        this.saving.set(false);
        this.closeForm();
      },
      error: (err) => {
        const msg = err?.status === 409
          ? `Le tenant ID "${dto.tenantId}" existe déjà. Choisissez un identifiant différent.`
          : (err?.error?.message ?? 'Erreur lors du provisioning.');
        this.saveError.set(msg);
        this.saving.set(false);
      },
    });
  }

  licenceBadgeClass(statut: string): string {
    if (statut === 'ACTIVE') return 'badge-active';
    if (statut === 'EXPIREE') return 'badge-expired';
    return 'badge-suspended';
  }

  licenceLabel(statut: string): string {
    if (statut === 'ACTIVE') return 'Active';
    if (statut === 'EXPIREE') return 'Expirée';
    return 'Suspendue';
  }

  askDelete(tenantId: string): void { this.confirmDeleteId.set(tenantId); }
  cancelDelete(): void { this.confirmDeleteId.set(null); }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.deleting.set(true);
    this.svc.deleteTenant(id).subscribe({
      next: () => {
        this.tenants.update((list) => list.filter((t) => t.tenantId !== id));
        this.confirmDeleteId.set(null);
        this.deleting.set(false);
      },
      error: () => { this.deleting.set(false); },
    });
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && c.touched);
  }

  isTarifInvalid(i: number, field: string): boolean {
    const c = this.tarifs.at(i).get(field);
    return !!(c && c.invalid && c.touched);
  }
}
