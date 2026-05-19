import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';
import { TenantConfigResponse, TenantConfigRequest, AdminKpis, AlerteDTO } from '../model/tenant-config';

@Injectable({ providedIn: 'root' })
export class TenantConfigService {
  private readonly http = inject(HttpClient);
  private readonly configBase = `${environment.apiUrl}/api/tenant-config`;
  private readonly dashBase   = `${environment.apiUrl}/api/dashboard`;

  getConfig(): Observable<TenantConfigResponse> {
    return this.http.get<TenantConfigResponse>(this.configBase);
  }

  saveConfig(dto: TenantConfigRequest): Observable<TenantConfigResponse> {
    return this.http.put<TenantConfigResponse>(this.configBase, dto);
  }

  getKpis(periode = 'MOIS'): Observable<AdminKpis> {
    const params = new HttpParams().set('periode', periode);
    return this.http.get<AdminKpis>(`${this.dashBase}/admin`, { params });
  }

  getDashboardAlertes(): Observable<AlerteDTO[]> {
    return this.http.get<AlerteDTO[]>(`${this.dashBase}/alertes`);
  }

  lancerAlertes(): Observable<Record<string, string>> {
    return this.http.post<Record<string, string>>(
      `${environment.apiUrl}/api/alertes/renouvellement/lancer`,
      null
    );
  }
}
