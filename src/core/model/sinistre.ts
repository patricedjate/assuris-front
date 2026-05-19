export interface SinistreResponse {
  id: number;
  reference: string;
  dateSinistre: string;
  heure?: string;
  dateDeclaration: string;
  lieu: string;
  description: string;
  avecBlesses: boolean;
  statut: 'OUVERT' | 'COMPLET' | 'EN_INSTRUCTION' | 'ACCEPTE' | 'REGLE' | 'REJETE';
  policeId: number;
}

export interface SinistreRequest {
  policeId: number;
  dateSinistre: string;
  heure: string;
  lieu: string;
  description: string;
  avecBlesses: boolean;
}
