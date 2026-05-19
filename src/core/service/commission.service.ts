import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';
import { CommissionResponse } from '../model/commission';
import { PageResponse } from '../model/page-response';

@Injectable({ providedIn: 'root' })
export class CommissionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/commissions`;

  getAll(page = 0, size = 20): Observable<PageResponse<CommissionResponse>> {
    return this.http.get<PageResponse<CommissionResponse>>(this.base, {
      params: { page, size },
    });
  }

  getByClient(clientId: number): Observable<CommissionResponse[]> {
    return this.http.get<CommissionResponse[]>(`${this.base}/client/${clientId}`);
  }

  calculer(): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.base}/calculer`, null);
  }

  verser(id: number): Observable<CommissionResponse> {
    return this.http.patch<CommissionResponse>(`${this.base}/${id}/verser`, null);
  }
}
