import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';
import { PoliceResponse } from '../model/police';
import { PoliceRequest } from '../model/tenant-config';
import { PageResponse } from '../model/page-response';

@Injectable({ providedIn: 'root' })
export class PoliceService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/polices`;

  getAll(page = 0, size = 20): Observable<PageResponse<PoliceResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<PoliceResponse>>(this.base, { params });
  }

  getById(id: number): Observable<PoliceResponse> {
    return this.http.get<PoliceResponse>(`${this.base}/${id}`);
  }

  getByClient(clientId: number): Observable<PoliceResponse[]> {
    return this.http.get<PoliceResponse[]>(`${this.base}/client/${clientId}`);
  }

  getExpirant(): Observable<PoliceResponse[]> {
    return this.http.get<PoliceResponse[]>(`${this.base}/expirant`);
  }

  create(dto: PoliceRequest): Observable<PoliceResponse> {
    return this.http.post<PoliceResponse>(this.base, dto);
  }

  activer(id: number): Observable<PoliceResponse> {
    return this.http.patch<PoliceResponse>(`${this.base}/${id}/activer`, null);
  }

  suspendre(id: number): Observable<PoliceResponse> {
    return this.http.patch<PoliceResponse>(`${this.base}/${id}/suspendre`, null);
  }

  resilier(id: number): Observable<PoliceResponse> {
    return this.http.patch<PoliceResponse>(`${this.base}/${id}/resilier`, null);
  }

  renouveler(id: number, nouvelleExpiration: string): Observable<PoliceResponse> {
    const params = new HttpParams().set('nouvelleExpiration', nouvelleExpiration);
    return this.http.patch<PoliceResponse>(`${this.base}/${id}/renouveler`, null, { params });
  }
}
