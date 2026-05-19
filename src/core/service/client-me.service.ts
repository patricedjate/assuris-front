import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';
import { ClientDashboard } from '../model/client';
import { PoliceResponse } from '../model/police';
import { SinistreResponse, SinistreRequest } from '../model/sinistre';
import { CommissionResponse } from '../model/commission';
import { ReseauResponse } from '../model/reseau';

@Injectable({ providedIn: 'root' })
export class ClientMeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/me`;

  dashboard(): Observable<ClientDashboard> {
    return this.http.get<ClientDashboard>(`${this.base}/dashboard`);
  }

  maPolice(): Observable<PoliceResponse> {
    return this.http.get<PoliceResponse>(`${this.base}/police`);
  }

  demanderRenouvellement(): Observable<PoliceResponse> {
    return this.http.post<PoliceResponse>(`${this.base}/police/renouvellement`, null);
  }

  mesCommissions(): Observable<CommissionResponse[]> {
    return this.http.get<CommissionResponse[]>(`${this.base}/commissions`);
  }

  monReseau(): Observable<ReseauResponse> {
    return this.http.get<ReseauResponse>(`${this.base}/reseau`);
  }

  mesSinistres(): Observable<SinistreResponse[]> {
    return this.http.get<SinistreResponse[]>(`${this.base}/sinistres`);
  }

  declarerSinistre(dto: SinistreRequest): Observable<SinistreResponse> {
    return this.http.post<SinistreResponse>(
      `${environment.apiUrl}/api/sinistres`,
      dto
    );
  }

  uploadDocuments(sinistreId: number, files: File[]): Observable<void> {
    const formData = new FormData();
    files.forEach(f => formData.append('fichiers', f));
    return this.http.post<void>(
      `${environment.apiUrl}/api/sinistres/${sinistreId}/documents`,
      formData
    );
  }

  changerMotDePasse(ancienMdp: string, nouveauMdp: string): Observable<string> {
    const params = new HttpParams()
      .set('ancienMdp', ancienMdp)
      .set('nouveauMdp', nouveauMdp);
    return this.http.patch(`${this.base}/mot-de-passe`, null, {
      params,
      responseType: 'text',
    });
  }

  downloadAttestation(): Observable<Blob> {
    return this.http.get(`${this.base}/police/attestation`, { responseType: 'blob' });
  }

  downloadCarteVerte(): Observable<Blob> {
    return this.http.get(`${this.base}/police/carte-verte`, { responseType: 'blob' });
  }

  downloadRecu(): Observable<Blob> {
    return this.http.get(`${this.base}/police/recu`, { responseType: 'blob' });
  }

  demanderMobileMoney(commissionId: number, operateur: string): Observable<CommissionResponse> {
    const params = new HttpParams().set('operateur', operateur);
    return this.http.post<CommissionResponse>(
      `${this.base}/commissions/${commissionId}/mobile-money`,
      null,
      { params }
    );
  }
}
