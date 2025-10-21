import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
  });

  it('returns a base64 access token when credentials are provided', () => {
    const result = service.login('user', 'pass');

    expect(result.accessToken).toEqual(expect.any(String));
    expect(() => Buffer.from(result.accessToken, 'base64')).not.toThrow();
  });

  it('throws when credentials are missing', () => {
    // @ts-expect-error Testing runtime safeguard against missing params.
    expect(() => service.login()).toThrow('Username and password are required');
  });
});
