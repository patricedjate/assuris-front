export interface PoliceResponse {
  id: number;
  reference: string;
  typePolice: string;
  prime: number;
  statut: 'EN_ATTENTE' | 'ACTIF' | 'EXPIRE' | 'SUSPENDU' | 'RESILIE' | 'ARCHIVE';
  dateEffet: string;
  dateExpiration: string;
  clientId: number;
  vehiculeId: number;
}
