import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Access and refresh tokens for the newly registered user',
    type: TokenResponseDto,
  })
  async register(@Body() payload: RegisterDto): Promise<TokenResponseDto> {
    const tokens = await this.authService.register(payload.username, payload.password);
    return { ...tokens };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in an existing user' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Access and refresh tokens for the authenticated user',
    type: TokenResponseDto,
  })
  async login(@Body() payload: LoginDto): Promise<TokenResponseDto> {
    const tokens = await this.authService.login(payload.username, payload.password);
    return { ...tokens };
  }
}
