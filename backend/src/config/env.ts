/**
 * Fail fast in production when critical security configuration is missing or weak.
 */
export function assertProductionConfig(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    // eslint-disable-next-line no-console
    console.error(
      'FATAL: In production, JWT_SECRET must be set and at least 32 characters. Refusing to start.'
    );
    process.exit(1);
  }

  const dsqlIam = process.env.AURORA_DSQL_IAM_AUTH === 'true';
  if (dsqlIam) {
    if (!process.env.AURORA_DSQL_HOST?.trim()) {
      // eslint-disable-next-line no-console
      console.error('FATAL: AURORA_DSQL_HOST is required when AURORA_DSQL_IAM_AUTH=true.');
      process.exit(1);
    }
    const region =
      process.env.AURORA_DSQL_REGION?.trim() ||
      process.env.AWS_REGION?.trim() ||
      process.env.AWS_DEFAULT_REGION?.trim();
    if (!region) {
      // eslint-disable-next-line no-console
      console.error(
        'FATAL: AWS_REGION (or AURORA_DSQL_REGION) is required when AURORA_DSQL_IAM_AUTH=true.'
      );
      process.exit(1);
    }
  } else if (!process.env.DATABASE_URL?.trim()) {
    // eslint-disable-next-line no-console
    console.error('FATAL: DATABASE_URL is required in production (or set AURORA_DSQL_IAM_AUTH=true).');
    process.exit(1);
  }

  if (!process.env.SUPER_ADMIN_MOBILE?.trim()) {
    // eslint-disable-next-line no-console
    console.error('FATAL: SUPER_ADMIN_MOBILE is required in production. Refusing to start.');
    process.exit(1);
  }

  if (!process.env.SUPER_ADMIN_OTP?.trim()) {
    // eslint-disable-next-line no-console
    console.error('FATAL: SUPER_ADMIN_OTP is required in production. Refusing to start.');
    process.exit(1);
  }
}
