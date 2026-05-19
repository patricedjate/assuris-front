import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantConfigService } from '../../../core/service/tenant-config.service';
import { TenantConfigRequest } from '../../../core/model/tenant-config';
import { ParametreTarifaire } from '../../../core/model/super-admin';

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
  selector: 'app-tenant-configuration',
  imports: [ReactiveFormsModule],
  templateUrl: './configuration.html',
  styleUrl: './configuration.css',
})
export class TenantConfiguration implements OnInit {
  private readonly svc = inject(TenantConfigService);
  private readonly fb  = inject(FormBuilder);

  loading = signal(true);
  saving  = signal(false);
  error   = signal<string | null>(null);
  success = signal<string | null>(null);

  readonly typesVehicule = TYPES_VEHICULE;
  readonly typesPolice   = TYPES_POLICE;

  form: FormGroup = this.fb.group({
    nomCompagnie:     ['', Validators.required],
    logoUrl:          [''],
    contactTelephone: [''],
    contactEmail:     ['', Validators.email],
    adresse:          [''],
    siteWeb:          [''],
    couleurPrimaire:  ['#1565c0'],
    parametresTarifaires: this.fb.array([]),
  });

  get tarifs(): FormArray { return this.form.get('parametresTarifaires') as FormArray; }

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.svc.getConfig().subscribe({
      next: (cfg) => {
        this.form.patchValue({
          nomCompagnie:     cfg.nomCompagnie,
          logoUrl:          cfg.logoUrl ?? '',
          contactTelephone: cfg.contactTelephone ?? '',
          contactEmail:     cfg.contactEmail ?? '',
          adresse:          cfg.adresse ?? '',
          siteWeb:          cfg.siteWeb ?? '',
          couleurPrimaire:  cfg.couleurPrimaire ?? '#1565c0',
        });
        this.tarifs.clear();
        (cfg.parametresTarifaires ?? []).forEach((t) => this.pushTarif(t));
        if (this.tarifs.length === 0) this.addTarif();
        this.loading.set(false);
      },
      error: () => {
        if (this.tarifs.length === 0) this.addTarif();
        this.loading.set(false);
      },
    });
  }

  addTarif(): void { this.tarifs.push(this.newTarifGroup()); }

  private newTarifGroup(t?: ParametreTarifaire): FormGroup {
    return this.fb.group({
      typeVehicule: [t?.typeVehicule ?? 'MOTO', Validators.required],
      typePolice:   [t?.typePolice   ?? 'RC',   Validators.required],
      primeMin:     [t?.primeMin     ?? 20000,  [Validators.required, Validators.min(1)]],
      primeMax:     [t?.primeMax     ?? 20000,  [Validators.required, Validators.min(1)]],
    });
  }

  private pushTarif(t: ParametreTarifaire): void { this.tarifs.push(this.newTarifGroup(t)); }

  removeTarif(i: number): void { if (this.tarifs.length > 1) this.tarifs.removeAt(i); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.success.set(null);
    this.error.set(null);
    const v = this.form.value;
    const dto: TenantConfigRequest = {
      nomCompagnie:     v.nomCompagnie,
      logoUrl:          v.logoUrl || undefined,
      contactTelephone: v.contactTelephone || undefined,
      contactEmail:     v.contactEmail || undefined,
      adresse:          v.adresse || undefined,
      siteWeb:          v.siteWeb || undefined,
      couleurPrimaire:  v.couleurPrimaire || undefined,
      parametresTarifaires: v.parametresTarifaires as ParametreTarifaire[],
    };
    this.svc.saveConfig(dto).subscribe({
      next: () => { this.success.set('Configuration sauvegardée avec succès.'); this.saving.set(false); },
      error: (err) => { this.error.set(err?.error?.message ?? 'Erreur lors de la sauvegarde.'); this.saving.set(false); },
    });
  }

  isInvalid(name: string): boolean { const c = this.form.get(name); return !!(c?.invalid && c?.touched); }
  isTarifInvalid(i: number, field: string): boolean { const c = this.tarifs.at(i).get(field); return !!(c?.invalid && c?.touched); }
}
