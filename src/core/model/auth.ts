export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tenantId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'CLIENT';
}