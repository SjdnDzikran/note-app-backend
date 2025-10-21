import { AuthTokens } from '../auth.service';

export class TokenResponseDto implements AuthTokens {
  accessToken!: string;
  refreshToken!: string;
}
