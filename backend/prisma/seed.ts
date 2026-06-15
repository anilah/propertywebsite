import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { applyDsqlIamDatabaseUrl } from '../src/config/dsqlDatabaseUrl.js';

dotenv.config();
await applyDsqlIamDatabaseUrl();

const prisma = new PrismaClient();

// Super admin mobile + PIN are controlled entirely via env vars (never stored in DB).
const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_MOBILE?.trim() || '0210000000';
const TEST_AGENT_PHONE = '0211111111';

// Agent initial PIN for dev/test seed — change via the app after first login.
// Super admin PIN comes from SUPER_ADMIN_OTP env var at login time (not stored in DB).
const TEST_AGENT_INITIAL_PIN = process.env.TEST_AGENT_INITIAL_PIN?.trim() || '111111';

function asBool(v: string | undefined): boolean {
  return String(v ?? '').trim().toLowerCase() === 'true';
}

async function main() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const allowTestUsers = asBool(process.env.SEED_ALLOW_TEST_USERS);
  const dryRun = asBool(process.env.SEED_DRY_RUN);

  // Safe default for UAT/prod: do nothing unless explicitly enabled.
  if (!allowTestUsers) {
    console.log('Seed skipped. Set SEED_ALLOW_TEST_USERS=true to seed demo users.');
    return;
  }

  // Build desired demo users (idempotent create-only behavior).
  // Super admin: no PIN stored in DB — always validated from SUPER_ADMIN_OTP env var at login.
  // Agent: PIN stored as bcrypt hash; initial value is TEST_AGENT_INITIAL_PIN.
  const demoUsers: { mobileNumber: string; role: 'SUPER_ADMIN' | 'AGENT'; initialPin?: string }[] = [
    { mobileNumber: SUPER_ADMIN_PHONE, role: 'SUPER_ADMIN' },
    { mobileNumber: TEST_AGENT_PHONE,  role: 'AGENT', initialPin: TEST_AGENT_INITIAL_PIN },
  ];

  for (const demo of demoUsers) {
    const existing = await prisma.user.findUnique({ where: { mobileNumber: demo.mobileNumber } });
    if (existing) {
      console.log(`[seed] exists -> skip for ${demo.mobileNumber} (role: ${existing.role})`);
      continue;
    }

    if (dryRun) {
      const pinHint = demo.role === 'SUPER_ADMIN'
        ? 'mobile from SUPER_ADMIN_MOBILE env, PIN from SUPER_ADMIN_OTP env'
        : `PIN: ${demo.initialPin}`;
      console.log(`[seed] dry-run -> would create ${demo.role}: ${demo.mobileNumber} (${pinHint})`);
      continue;
    }

    const pinData = demo.initialPin ? { pin: demo.initialPin } : {};
    await prisma.user.create({
      data: { mobileNumber: demo.mobileNumber, role: demo.role, isActive: true, ...pinData },
    });

    if (demo.role === 'SUPER_ADMIN') {
      console.log(`[seed] created SUPER_ADMIN: ${demo.mobileNumber}  mobile -> SUPER_ADMIN_MOBILE  PIN -> SUPER_ADMIN_OTP (currently: ${process.env.SUPER_ADMIN_OTP ?? 'not set'})`);
    } else {
      console.log(`[seed] created ${demo.role}: ${demo.mobileNumber}  initial PIN: ${demo.initialPin}`);
    }
  }

  console.log(`Seed completed. env=${nodeEnv} allowTestUsers=${allowTestUsers} dryRun=${dryRun}`);
  console.log('For UAT/prod, keep SEED_ALLOW_TEST_USERS=false unless you intentionally need demo users.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
