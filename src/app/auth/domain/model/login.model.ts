export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  accessToken: string;
  tokenType: string;
  username: string;
  role: string;
}

export interface AuthToken {
  accessToken: string;
  tokenType: string;
  expiresAt?: Date;
}
