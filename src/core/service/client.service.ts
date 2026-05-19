import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';
import { ClientRequest, ClientResponse, InscriptionRequest } from '../model/client';
import { InscriptionResponse } from '../model/tenant-config';
import { PageResponse } from '../model/page-response';
import { ParrainageNode } from '../model/reseau';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/clients`;

  getAll(page = 0, size = 20): Observable<PageResponse<ClientResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'nom,asc');
    return this.http.get<PageResponse<ClientResponse>>(this.base, { params });
  }

  getById(id: number): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.base}/${id}`);
  }

  inscrire(dto: InscriptionRequest): Observable<InscriptionResponse> {
    return this.http.post<InscriptionResponse>(`${this.base}/inscription`, dto);
  }

  update(id: number, dto: ClientRequest): Observable<ClientResponse> {
    return this.http.put<ClientResponse>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getReseau(clientId: number): Observable<ParrainageNode[]> {
    return this.http.get<ParrainageNode[]>(`${this.base}/${clientId}/reseau`);
  }
}
