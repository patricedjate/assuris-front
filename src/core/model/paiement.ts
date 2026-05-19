export interface PaiementResponse {
  id: number;
  reference: string;
  montant: number;
  mode: 'ESPECE' | 'VISA' | 'MOBILE_MONEY' | 'VIREMENT' | 'PAYPAL' | 'WALLET';
  date: string;
  preuveUrl?: string;
  statut: 'EN_ATTENTE' | 'PAYE' | 'ECHEC' | 'ANNULE';
  policeId: number;
  commissionId?: number;
}

export interface PaiementRequest {
  montant: number;
  mode: string;
  preuveUrl?: string;
  policeId: number;
  commissionId?: number;
  nouveauTypePolice?: string;
}
