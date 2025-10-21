import { ApiProperty } from '@nestjs/swagger';
import { AuthTokens } from '../auth.service';

export class TokenResponseDto implements AuthTokens {
  @ApiProperty({
    description: 'JWT access token valid for one hour',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh token valid for seven days',
  })
  refreshToken!: string;
}
