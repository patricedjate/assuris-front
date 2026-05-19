import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';

@Injectable({ providedIn: 'root' })
export class RapportService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/rapports`;

  mensuel(annee: number, mois: number, format: 'pdf' | 'excel'): Observable<Blob> {
    const params = new HttpParams().set('annee', annee).set('mois', mois).set('format', format);
    return this.http.get(`${this.base}/mensuel`, { params, responseType: 'blob' });
  }

  trimestriel(annee: number, trimestre: number, format: 'pdf' | 'excel'): Observable<Blob> {
    const params = new HttpParams().set('annee', annee).set('trimestre', trimestre).set('format', format);
    return this.http.get(`${this.base}/trimestriel`, { params, responseType: 'blob' });
  }

  annuel(annee: number, format: 'pdf' | 'excel'): Observable<Blob> {
    const params = new HttpParams().set('annee', annee).set('format', format);
    return this.http.get(`${this.base}/annuel`, { params, responseType: 'blob' });
  }
}
