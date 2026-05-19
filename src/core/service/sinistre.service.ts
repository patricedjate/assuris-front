import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';
import { SinistreResponse } from '../model/sinistre';
import { DocumentSinistreResponse } from '../model/document';
import { PageResponse } from '../model/page-response';

@Injectable({ providedIn: 'root' })
export class SinistreService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/sinistres`;

  getAll(page = 0, size = 20): Observable<PageResponse<SinistreResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<SinistreResponse>>(this.base, { params });
  }

  getById(id: number): Observable<SinistreResponse> {
    return this.http.get<SinistreResponse>(`${this.base}/${id}`);
  }

  getByPolice(policeId: number): Observable<SinistreResponse[]> {
    return this.http.get<SinistreResponse[]>(`${this.base}/police/${policeId}`);
  }

  changerStatut(id: number, statut: string): Observable<SinistreResponse> {
    const params = new HttpParams().set('statut', statut);
    return this.http.patch<SinistreResponse>(`${this.base}/${id}/statut`, null, { params });
  }

  getDocuments(id: number): Observable<DocumentSinistreResponse[]> {
    return this.http.get<DocumentSinistreResponse[]>(`${this.base}/${id}/documents`);
  }

  downloadDocument(sinistreId: number, documentId: number): Observable<Blob> {
    return this.http.get(`${this.base}/${sinistreId}/documents/${documentId}`, { responseType: 'blob' });
  }
}
