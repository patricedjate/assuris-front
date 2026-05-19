export interface FilleulDetail {
  id: number;
  nom: string;
  codeReference: string;
  dateInscription: string;
  statutPolice: 'EN_ATTENTE' | 'ACTIF' | 'EXPIRE' | 'SUSPENDU' | 'RESILIE' | 'ARCHIVE';
  moisConservation: number;
}

export interface ReseauResponse {
  totalN1: number;
  actifN1: number;
  totalN2: number;
  actifN2: number;
  totalN3: number;
  actifN3: number;
  qualificationAtteinte: boolean;
  progressionVers3: number;
  filleulsN1?: FilleulDetail[];
  filleulsN2?: FilleulDetail[];
  filleulsN3?: FilleulDetail[];
}

export interface ParrainageNode {
  id: number;
  nom: string;
  codeParrainage: string;
  codeReference: string;
  dateInscription: string;
  statutPolice: string;
  niveau: number;
  filleuls?: ParrainageNode[];
}
