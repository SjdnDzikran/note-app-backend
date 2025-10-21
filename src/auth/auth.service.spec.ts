import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { JWT_SECRET } from './constants';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
          secret: JWT_SECRET,
        }),
      ],
      providers: [AuthService, UsersService],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await moduleRef.close();
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
