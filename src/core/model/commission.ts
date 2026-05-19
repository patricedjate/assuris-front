export interface CommissionResponse {
  id: number;
  debutPeriode: string;
  finPeriode: string;
  niveau: 1 | 2 | 3;
  montant: number;
  statut: 'QUALIFIE' | 'EN_COURS' | 'EN_ATTENTE' | 'VERSE';
  modeVersement?: string;
  clientId: number;
}
