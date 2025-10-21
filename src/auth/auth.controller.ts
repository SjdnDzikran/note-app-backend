import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() payload: RegisterDto): Promise<TokenResponseDto> {
    const tokens = await this.authService.register(payload.username, payload.password);
    return { ...tokens };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() payload: LoginDto): Promise<TokenResponseDto> {
    const tokens = await this.authService.login(payload.username, payload.password);
    return { ...tokens };
  }
}
