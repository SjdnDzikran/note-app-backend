import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWT_SECRET } from './constants';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
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
      controllers: [AuthController],
      providers: [AuthService, UsersService],
    }).compile();

    controller = moduleRef.get<AuthController>(AuthController);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('registers users and returns token pairs', async () => {
    const tokens = await controller.register({ username: 'user1', password: 'password123' });

    expect(tokens.accessToken).toEqual(expect.any(String));
    expect(tokens.refreshToken).toEqual(expect.any(String));
  });

  it('logs in users and returns token pairs', async () => {
    await controller.register({ username: 'user2', password: 'password123' });
    const tokens = await controller.login({ username: 'user2', password: 'password123' });

    expect(tokens.accessToken).toEqual(expect.any(String));
    expect(tokens.refreshToken).toEqual(expect.any(String));
  });
});
