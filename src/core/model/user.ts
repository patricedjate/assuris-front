export type RoleInterne = 'ADMIN' | 'AGENT';

export interface UserResponse {
  id: number;
  username: string;
  role: RoleInterne;
  actif: boolean;
  createdAt: string;
}

export interface UserRequest {
  username: string;
  password: string;
  role: RoleInterne;
}
