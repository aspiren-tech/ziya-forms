import bcrypt from 'bcryptjs';
import pool from './connection';
import { createUser, getUserByEmail, updateUser } from './utils';

const SUPER_ADMIN_EMAIL = 'superadmin@ziyaforms.com';
const SUPER_ADMIN_PASSWORD = 'ziyaforms@2026';

export async function ensureSuperAdminAccount() {
  const existing = await getUserByEmail(SUPER_ADMIN_EMAIL);
  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

  if (!existing) {
    const superAdmin = await createUser({
      email: SUPER_ADMIN_EMAIL,
      full_name: 'Super Admin',
      password_hash: passwordHash,
      role: 'super_admin',
      status: 'active',
      billing_plan: 'paid',
    });

    return superAdmin;
  }

  await updateUser(existing.id, {
    role: 'super_admin',
    status: 'active',
    billing_plan: 'paid',
  });

  const db = await pool.getConnection();

  try {
    await db.execute(
      'UPDATE users SET password_hash = ?, full_name = ?, role = ?, status = ?, billing_plan = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
      [passwordHash, 'Super Admin', 'super_admin', 'active', 'paid', SUPER_ADMIN_EMAIL]
    );
  } finally {
    db.release();
  }

  return await getUserByEmail(SUPER_ADMIN_EMAIL);
}
