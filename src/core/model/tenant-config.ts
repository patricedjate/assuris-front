import { ParametreTarifaire } from './super-admin';

export interface TenantConfigResponse {
  id: number;
  tenantId: string;
  nomCompagnie: string;
  logoUrl?: string;
  contactTelephone?: string;
  contactEmail?: string;
  adresse?: string;
  siteWeb?: string;
  couleurPrimaire?: string;
  parametresTarifaires: ParametreTarifaire[];
}

export interface TenantConfigRequest {
  nomCompagnie: string;
  logoUrl?: string;
  contactTelephone?: string;
  contactEmail?: string;
  adresse?: string;
  siteWeb?: string;
  couleurPrimaire?: string;
  parametresTarifaires: ParametreTarifaire[];
}

export interface AdminKpis {
  primesEncaissees: number;
  clientsActifs: number;
  parrainagesActifs: number;
  commissionsDues: number;
  policesExpirant30j: number;
  sinistresOuverts: number;
}

export interface InscriptionResponse {
  clientId: number;
  nom: string;
  codeReference: string;
  codeParrainage: string;
  vehiculeId: number;
  immatriculation: string;
  policeId: number;
  referencePolice: string;
  statutPolice: string;
  tenantId: string;
  username: string;
  motDePasseDefaut: string;
}

export interface PoliceRequest {
  typePolice: string;
  prime: number;
  dateEffet: string;
  dateExpiration: string;
  clientId: number;
  vehiculeId: number;
}

export type TypeAlerte = 'URGENT' | 'AVERTISSEMENT' | 'INFO' | 'SUCCES';

export interface AlerteDTO {
  type: TypeAlerte;
  couleur: string;
  message: string;
  action: string;
}
