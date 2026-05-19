import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environnements/environnement';
import { UserResponse, UserRequest } from '../model/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/users`;

  getAll(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.base);
  }

  create(dto: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.base, dto);
  }

  desactiver(id: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.base}/${id}/desactiver`, {});
  }

  reactiver(id: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.base}/${id}/reactiver`, {});
  }

  resetPassword(id: number, nouveauMotDePasse: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/password`, { nouveauMotDePasse });
  }
}
