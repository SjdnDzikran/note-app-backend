export interface User {
  id: string;
  username: string;
  passwordHash: string;
  refreshTokenHash?: string | null;
}
