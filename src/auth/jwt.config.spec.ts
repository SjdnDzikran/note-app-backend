import { ConfigService } from '@nestjs/config';
import { jwtAsyncConfig } from './jwt.config';

describe('jwtAsyncConfig', () => {
  const buildConfigService = (secret: string | undefined): ConfigService =>
    ({
      get: (key: string) => (key === 'JWT_SECRET' ? secret : undefined),
    }) as unknown as ConfigService;

  it('signs tokens with the secret from the environment', () => {
    const options = jwtAsyncConfig.useFactory!(
      buildConfigService('env-secret'),
    );

    expect(options).toMatchObject({ global: false, secret: 'env-secret' });
  });

  it('refuses to start when JWT_SECRET is not set', () => {
    expect(() =>
      jwtAsyncConfig.useFactory!(buildConfigService(undefined)),
    ).toThrow('JWT_SECRET');
  });
});
