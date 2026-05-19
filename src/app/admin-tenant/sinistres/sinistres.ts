import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SinistreService } from '../../../core/service/sinistre.service';
import { SinistreResponse } from '../../../core/model/sinistre';
import { DocumentSinistreResponse } from '../../../core/model/document';
import { PageResponse } from '../../../core/model/page-response';

const STATUTS: SinistreResponse['statut'][] = [
  'OUVERT', 'COMPLET', 'EN_INSTRUCTION', 'ACCEPTE', 'REGLE', 'REJETE',
];

const STATUT_LABELS: Record<string, string> = {
  OUVERT: 'Ouvert — pièces en attente',
  COMPLET: 'Complet — à transmettre à l\'assureur',
  EN_INSTRUCTION: 'En instruction',
  ACCEPTE: 'Accepté — indemnisation accordée',
  REGLE: 'Réglé — indemnisation versée',
  REJETE: 'Rejeté',
};

@Component({
  selector: 'app-tenant-sinistres',
  imports: [DatePipe, FormsModule],
  templateUrl: './sinistres.html',
  styleUrl: './sinistres.css',
})
export class TenantSinistres implements OnInit {
  private readonly svc = inject(SinistreService);

  page     = signal(0);
  data     = signal<PageResponse<SinistreResponse> | null>(null);
  loading  = signal(true);
  error    = signal<string | null>(null);

  dossier       = signal<SinistreResponse | null>(null);
  documents     = signal<DocumentSinistreResponse[]>([]);
  loadingDocs   = signal(false);
  downloadingId = signal<number | null>(null);

  nouveauStatut  = signal('');
  changing       = signal(false);
  changeSuccess  = signal(false);
  changeError    = signal<string | null>(null);

  readonly statuts      = STATUTS;
  readonly statutLabels = STATUT_LABELS;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll(this.page()).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => { this.error.set('Erreur de chargement.'); this.loading.set(false); },
    });
  }

  goPage(p: number): void { this.page.set(p); this.load(); }

  ouvrirDossier(s: SinistreResponse): void {
    this.dossier.set(s);
    this.nouveauStatut.set(s.statut);
    this.changeSuccess.set(false);
    this.changeError.set(null);
    this.documents.set([]);
    this.loadingDocs.set(true);
    this.svc.getDocuments(s.id).subscribe({
      next: (docs) => { this.documents.set(docs); this.loadingDocs.set(false); },
      error: () => this.loadingDocs.set(false),
    });
  }

  fermerDossier(): void { this.dossier.set(null); }

  confirmerStatut(): void {
    const d = this.dossier();
    if (!d || this.nouveauStatut() === d.statut) return;
    this.changing.set(true);
    this.changeError.set(null);
    this.changeSuccess.set(false);
    this.svc.changerStatut(d.id, this.nouveauStatut()).subscribe({
      next: (updated) => {
        this.dossier.set(updated);
        this.data.update(pg => pg
          ? { ...pg, contenu: pg.contenu.map(s => s.id === updated.id ? updated : s) }
          : pg
        );
        this.changing.set(false);
        this.changeSuccess.set(true);
      },
      error: (err) => {
        this.changeError.set(err?.error?.message ?? 'Erreur lors du changement de statut.');
        this.changing.set(false);
      },
    });
  }

  telechargerDocument(doc: DocumentSinistreResponse): void {
    const d = this.dossier();
    if (!d) return;
    this.downloadingId.set(doc.id);
    this.svc.downloadDocument(d.id, doc.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = doc.nom; a.click();
        URL.revokeObjectURL(url);
        this.downloadingId.set(null);
      },
      error: () => this.downloadingId.set(null),
    });
  }

  isImage(doc: DocumentSinistreResponse): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.nom);
  }

  isPdf(doc: DocumentSinistreResponse): boolean {
    return /\.pdf$/i.test(doc.nom);
  }

  statutClass(s: string): string {
    const map: Record<string, string> = {
      OUVERT: 'badge-red', COMPLET: 'badge-blue', EN_INSTRUCTION: 'badge-orange',
      ACCEPTE: 'badge-green', REGLE: 'badge-green', REJETE: 'badge-gray',
    };
    return map[s] ?? 'badge-gray';
  }

  get pages(): number[] {
    return Array.from({ length: this.data()?.totalPages ?? 0 }, (_, i) => i);
  }
}
