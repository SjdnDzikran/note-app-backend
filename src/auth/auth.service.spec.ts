import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JWT_SECRET } from './constants';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: JWT_SECRET,
        }),
      ],
      providers: [AuthService, UsersService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('registers new users and returns tokens', async () => {
    const tokens = await service.register('alice', 'password123');

    expect(tokens.accessToken).toEqual(expect.any(String));
    expect(tokens.refreshToken).toEqual(expect.any(String));

    const user = await usersService.findByUsername('alice');
    expect(user?.refreshTokenHash).toEqual(expect.any(String));
  });

  it('prevents duplicate usernames', async () => {
    await service.register('bob', 'password123');

    await expect(service.register('bob', 'password123')).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in existing users with correct credentials', async () => {
    await service.register('charlie', 'password123');
    const tokens = await service.login('charlie', 'password123');

    expect(tokens.accessToken).toEqual(expect.any(String));
    expect(tokens.refreshToken).toEqual(expect.any(String));
  });

  it('rejects invalid credentials', async () => {
    await service.register('dana', 'password123');

    await expect(service.login('dana', 'wrong-password')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
