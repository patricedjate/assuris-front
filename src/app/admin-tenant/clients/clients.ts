import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ClientService } from '../../../core/service/client.service';
import { ClientResponse, InscriptionRequest } from '../../../core/model/client';
import { InscriptionResponse } from '../../../core/model/tenant-config';
import { PageResponse } from '../../../core/model/page-response';
import { ParrainageNode } from '../../../core/model/reseau';

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

const MODES_PAIEMENT = [
  { value: 'ESPECE',       label: 'Espèces' },
  { value: 'VISA',         label: 'Carte Visa' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'VIREMENT',     label: 'Virement bancaire' },
  { value: 'PAYPAL',       label: 'PayPal' },
  { value: 'WALLET',       label: 'Wallet' },
];

@Component({
  selector: 'app-tenant-clients',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class TenantClients implements OnInit {
  private readonly svc = inject(ClientService);
  private readonly fb  = inject(FormBuilder);

  page  = signal(0);
  data  = signal<PageResponse<ClientResponse> | null>(null);
  loading = signal(true);
  error   = signal<string | null>(null);

  showForm     = signal(false);
  saving       = signal(false);
  saveError    = signal<string | null>(null);
  inscriptionResult = signal<InscriptionResponse | null>(null);

  confirmDeleteId = signal<number | null>(null);
  deleting = signal(false);

  reseauClientNom = signal<string | null>(null);
  reseauData = signal<ParrainageNode[]>([]);
  reseauLoading = signal(false);
  reseauExpandedIds = signal<Set<number>>(new Set());

  readonly typesVehicule = TYPES_VEHICULE;
  readonly typesPolice   = TYPES_POLICE;
  readonly modesPaiement = MODES_PAIEMENT;

  form: FormGroup = this.fb.group({
    nom:               ['', Validators.required],
    cni:               ['', Validators.required],
    telephone:         ['', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
    email:             ['', Validators.email],
    codeParrainParrain:[''],
    immatriculation:   ['', Validators.required],
    marque:            ['', Validators.required],
    modele:            ['', Validators.required],
    cylindre:          [null],
    typeVehicule:      ['MOTO',   Validators.required],
    typePolice:        ['RC',     Validators.required],
    prime:             [null, [Validators.required, Validators.min(1)]],
    dateEffet:         ['', Validators.required],
    dateExpiration:    ['', Validators.required],
    modePaiement:      ['ESPECE', Validators.required],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll(this.page()).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => { this.error.set('Erreur de chargement.'); this.loading.set(false); },
    });
  }

  goPage(p: number): void { this.page.set(p); this.load(); }

  openForm(): void {
    this.form.reset({ typeVehicule: 'MOTO', typePolice: 'RC', modePaiement: 'ESPECE' });
    this.saveError.set(null);
    this.inscriptionResult.set(null);
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.saveError.set(null);
    const v = this.form.value;
    const dto: InscriptionRequest = {
      nom: v.nom, cni: v.cni, telephone: v.telephone,
      email: v.email || undefined,
      codeParrainParrain: v.codeParrainParrain || undefined,
      immatriculation: v.immatriculation, marque: v.marque, modele: v.modele,
      cylindre: v.cylindre || undefined, typeVehicule: v.typeVehicule,
      typePolice: v.typePolice, prime: v.prime,
      dateEffet: v.dateEffet, dateExpiration: v.dateExpiration,
      modePaiement: v.modePaiement,
    };
    this.svc.inscrire(dto).subscribe({
      next: (res) => {
        this.inscriptionResult.set(res as InscriptionResponse);
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        this.saveError.set(err?.error?.message ?? "Erreur lors de l'inscription.");
        this.saving.set(false);
      },
    });
  }

  closeResult(): void { this.inscriptionResult.set(null); this.closeForm(); }

  voirReseau(client: ClientResponse): void {
    this.reseauClientNom.set(client.nom);
    this.reseauData.set([]);
    this.reseauExpandedIds.set(new Set());
    this.reseauLoading.set(true);
    this.svc.getReseau(client.id).subscribe({
      next: (nodes) => { this.reseauData.set(nodes); this.reseauLoading.set(false); },
      error: () => this.reseauLoading.set(false),
    });
  }

  fermerReseau(): void { this.reseauClientNom.set(null); }

  toggleReseauNode(id: number): void {
    this.reseauExpandedIds.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isExpanded(id: number): boolean { return this.reseauExpandedIds().has(id); }

  statutNodeClass(statut: string): string {
    if (statut === 'ACTIF') return 'node-actif';
    if (statut === 'EN_ATTENTE') return 'node-attente';
    if (statut === 'EXPIRE') return 'node-expire';
    return 'node-autre';
  }

  printReseau(): void { window.print(); }

  askDelete(id: number): void { this.confirmDeleteId.set(id); }
  cancelDelete(): void { this.confirmDeleteId.set(null); }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (id === null) return;
    this.deleting.set(true);
    this.svc.delete(id).subscribe({
      next: () => { this.confirmDeleteId.set(null); this.deleting.set(false); this.load(); },
      error: () => { this.deleting.set(false); },
    });
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c?.invalid && c?.touched);
  }

  get pages(): number[] {
    const total = this.data()?.totalPages ?? 0;
    return Array.from({ length: total }, (_, i) => i);
  }
}
