import { PoliceResponse } from './police';
import { ReseauResponse } from './reseau';
import { SinistreResponse } from './sinistre';

export interface ClientDashboard {
  nom: string;
  codeParrainage: string;
  tenantId: string;
  badgePolice: 'VALIDE' | 'EXPIRATION_PROCHE' | 'EXPIRE' | 'EN_ATTENTE' | 'AUCUNE';
  police: PoliceResponse | null;
  reseau: ReseauResponse;
  totalCommissions: number;
  statutQualification: 'QUALIFIE' | 'EN_COURS' | 'EN_ATTENTE';
  prochaineEcheance: string;
  sinistresOuverts: number;
  dernieresSinistres: SinistreResponse[];
}

export interface ClientResponse {
  id: number;
  nom: string;
  cni: string;
  telephone: string;
  codeParrainage: string;
  codeReference: string;
  tenantId: string;
  dateInscription: string;
}

export interface ClientRequest {
  nom: string;
  cni: string;
  telephone: string;
}

export interface InscriptionRequest {
  // client
  nom: string;
  cni: string;
  telephone: string;
  email?: string;
  codeParrainParrain?: string;
  // vehicule
  immatriculation: string;
  marque: string;
  modele: string;
  cylindre?: number;
  typeVehicule: string;
  // police
  typePolice: string;
  prime: number;
  dateEffet: string;
  dateExpiration: string;
  modePaiement: string;
}
