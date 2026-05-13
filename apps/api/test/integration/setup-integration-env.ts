/**
 * Runs before the integration spec file is loaded (see jest `setupFiles`).
 * JwtModule.register() and JwtStrategy read JWT_SECRET when AuthModule / providers
 * are first constructed — setting this only in `beforeAll` is too late.
 */
if (!process.env.JWT_SECRET?.trim()) {
  process.env.JWT_SECRET = 'integration-jwt-secret';
}
