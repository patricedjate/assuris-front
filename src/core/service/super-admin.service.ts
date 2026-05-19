import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';
import {
  PlatformStats,
  TenantSummary,
  TenantProvisioningRequest,
  LicenceResponse,
} from '../model/super-admin';

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/super-admin`;

  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${this.base}/stats`);
  }

  getTenants(): Observable<TenantSummary[]> {
    return this.http.get<TenantSummary[]>(`${this.base}/tenants`);
  }

  getTenant(tenantId: string): Observable<TenantSummary> {
    return this.http.get<TenantSummary>(`${this.base}/tenants/${tenantId}`);
  }

  provisionTenant(dto: TenantProvisioningRequest): Observable<TenantSummary> {
    return this.http.post<TenantSummary>(`${this.base}/tenants`, dto);
  }

  deleteTenant(tenantId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/tenants/${tenantId}`);
  }

  getLicence(tenantId: string): Observable<LicenceResponse> {
    return this.http.get<LicenceResponse>(`${this.base}/tenants/${tenantId}/licence`);
  }

  renouvelerLicence(tenantId: string): Observable<LicenceResponse> {
    return this.http.patch<LicenceResponse>(`${this.base}/tenants/${tenantId}/licence/renouveler`, {});
  }

  suspendreLicence(tenantId: string): Observable<LicenceResponse> {
    return this.http.patch<LicenceResponse>(`${this.base}/tenants/${tenantId}/licence/suspendre`, {});
  }

  reactiverLicence(tenantId: string): Observable<LicenceResponse> {
    return this.http.patch<LicenceResponse>(`${this.base}/tenants/${tenantId}/licence/reactiver`, {});
  }
}
