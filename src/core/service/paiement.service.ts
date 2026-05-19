import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';
import { PaiementResponse, PaiementRequest } from '../model/paiement';

@Injectable({ providedIn: 'root' })
export class PaiementService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/paiements`;

  getAll(): Observable<PaiementResponse[]> {
    return this.http.get<PaiementResponse[]>(this.base);
  }

  getByPolice(policeId: number): Observable<PaiementResponse[]> {
    return this.http.get<PaiementResponse[]>(`${this.base}/police/${policeId}`);
  }

  create(dto: PaiementRequest): Observable<PaiementResponse> {
    return this.http.post<PaiementResponse>(this.base, dto);
  }

  valider(id: number): Observable<PaiementResponse> {
    return this.http.patch<PaiementResponse>(`${this.base}/${id}/valider`, null);
  }
}
