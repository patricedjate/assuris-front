export type StatutLicence = 'ACTIVE' | 'EXPIREE' | 'SUSPENDUE';

export interface LicenceResponse {
  tenantId: string;
  dateDebut: string;
  dateExpiration: string;
  statut: StatutLicence;
  joursRestants: number;
}

export interface ParametreTarifaire {
  typeVehicule: string;
  typePolice: string;
  primeMin: number;
  primeMax: number;
}

export interface TenantSummary {
  tenantId: string;
  nomCompagnie: string;
  contactEmail: string;
  nbUtilisateurs: number;
  nbClients: number;
  nbPolices: number;
  createdAt: string;
  licence: LicenceResponse;
}

export interface PlatformStats {
  totalTenants: number;
  totalUtilisateurs: number;
  totalClients: number;
  totalPolices: number;
  tenants: TenantSummary[];
}

export interface TenantProvisioningRequest {
  tenantId: string;
  adminUsername: string;
  adminPassword: string;
  nomCompagnie: string;
  contactTelephone?: string;
  contactEmail?: string;
  adresse?: string;
  siteWeb?: string;
  couleurPrimaire?: string;
  parametresTarifaires: ParametreTarifaire[];
}
