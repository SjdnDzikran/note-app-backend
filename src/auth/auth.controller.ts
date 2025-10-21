import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

interface LoginDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto): { accessToken: string } {
    const { username, password } = body;
    return this.authService.login(username, password);
  }
}
