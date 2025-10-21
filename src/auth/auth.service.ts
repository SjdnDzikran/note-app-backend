import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(username: string, password: string): { accessToken: string } {
    // Placeholder logic; integrate with real user validation later.
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    return {
      accessToken: Buffer.from(`${username}:${Date.now()}`).toString('base64'),
    };
  }
}
