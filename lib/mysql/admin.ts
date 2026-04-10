import pool from './connection';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { ensureAdminSchema } from './ensure-schema';
import type {
  AdminDashboardStats,
  AdminUserDetails,
  AdminUserSummary,
} from '@/lib/types/database';

type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: 'active' | 'inactive' | string | null;
  role: string | null;
  billing_plan: 'free' | 'paid' | null;
  created_at: string;
  updated_at: string;
  forms_count: number | string | null;
  embedded_forms_count: number | string | null;
};

type AdminUserQueryOptions = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

const normalizeRow = (row: AdminUserRow): AdminUserSummary => ({
  id: row.id,
  name: row.full_name || row.email.split('@')[0],
  email: row.email,
  status: row.status === 'inactive' ? 'inactive' : 'active',
  role: row.role || 'user',
  billingPlan: row.billing_plan === 'paid' ? 'paid' : 'free',
  formsCount: Number(row.forms_count || 0),
  embeddedFormsCount: Number(row.embedded_forms_count || 0),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  avatarUrl: row.avatar_url,
});

const buildFilters = (search?: string, status?: string) => {
  const clauses: string[] = [];
  const values: Array<string> = [];

  if (search && search.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    clauses.push("(LOWER(u.email) LIKE ? OR LOWER(COALESCE(u.full_name, '')) LIKE ?)");
    values.push(term, term);
  }

  if (status && status !== 'all') {
    clauses.push("COALESCE(u.status, 'active') = ?");
    values.push(status);
  }

  return { clauses, values };
};

const getOrderClause = (sortBy?: string, sortOrder?: 'asc' | 'desc') => {
  const direction = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const map: Record<string, string> = {
    name: 'u.full_name',
    email: 'u.email',
    status: 'u.status',
    role: 'u.role',
    createdAt: 'u.created_at',
    formsCount: 'forms_count',
    embeddedFormsCount: 'embedded_forms_count',
  };

  return `${map[sortBy || 'createdAt'] || 'u.created_at'} ${direction}`;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  await ensureAdminSchema();
  const connection = await pool.getConnection();

  try {
    const [userRows]: any = await connection.execute(
      `
        SELECT
          COUNT(*) AS totalUsers,
          COALESCE(SUM(CASE WHEN COALESCE(status, 'active') = 'active' THEN 1 ELSE 0 END), 0) AS activeUsers,
          COALESCE(SUM(CASE WHEN COALESCE(status, 'active') = 'inactive' THEN 1 ELSE 0 END), 0) AS inactiveUsers
        FROM users
      `
    );

    const [formRows]: any = await connection.execute(
      `
        SELECT
          COALESCE(COUNT(*), 0) AS totalForms,
          COALESCE(SUM(CASE WHEN COALESCE(is_embedded, 0) = 1 THEN 1 ELSE 0 END), 0) AS embeddedForms
        FROM forms
      `
    );

    return {
      totalUsers: Number(userRows[0]?.totalUsers || 0),
      activeUsers: Number(userRows[0]?.activeUsers || 0),
      inactiveUsers: Number(userRows[0]?.inactiveUsers || 0),
      totalForms: Number(formRows[0]?.totalForms || 0),
      embeddedForms: Number(formRows[0]?.embeddedForms || 0),
    };
  } finally {
    connection.release();
  }
}

export async function getAdminUsers(options: AdminUserQueryOptions): Promise<{
  users: AdminUserSummary[];
  total: number;
  page: number;
  limit: number;
}> {
  await ensureAdminSchema();
  const connection = await pool.getConnection();

  try {
    const { clauses, values } = buildFilters(options.search, options.status);
    const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const [countRows]: any = await connection.execute(
      `
        SELECT COUNT(*) AS total
        FROM users u
        WHERE COALESCE(u.role, 'user') != 'super_admin'
        ${whereClause}
      `,
      values
    );

    const total = Number(countRows[0]?.total || 0);
    const offset = (options.page - 1) * options.limit;
    const orderClause = getOrderClause(options.sortBy, options.sortOrder);

    const [rows]: any = await connection.execute(
      `
        SELECT
          u.id,
          u.email,
          u.full_name,
          u.avatar_url,
          COALESCE(u.status, 'active') AS status,
          COALESCE(u.role, 'user') AS role,
          COALESCE(u.billing_plan, 'free') AS billing_plan,
          u.created_at,
          u.updated_at,
          COALESCE(form_stats.forms_count, 0) AS forms_count,
          COALESCE(form_stats.embedded_forms_count, 0) AS embedded_forms_count
        FROM users u
        LEFT JOIN (
          SELECT
            user_id,
            COUNT(*) AS forms_count,
            COALESCE(SUM(CASE WHEN COALESCE(is_embedded, 0) = 1 THEN 1 ELSE 0 END), 0) AS embedded_forms_count
          FROM forms
          GROUP BY user_id
        ) form_stats ON form_stats.user_id = u.id
        WHERE COALESCE(u.role, 'user') != 'super_admin'
        ${whereClause}
        ORDER BY ${orderClause}
        LIMIT ${options.limit} OFFSET ${offset}
      `,
      values
    );

    return {
      users: rows.map(normalizeRow),
      total,
      page: options.page,
      limit: options.limit,
    };
  } finally {
    connection.release();
  }
}

export async function getAdminUserById(id: string): Promise<AdminUserDetails | null> {
  await ensureAdminSchema();
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.execute(
      `
        SELECT
          u.id,
          u.email,
          u.full_name,
          u.avatar_url,
          COALESCE(u.status, 'active') AS status,
          COALESCE(u.role, 'user') AS role,
          COALESCE(u.billing_plan, 'free') AS billing_plan,
          u.created_at,
          u.updated_at,
          COALESCE(form_stats.forms_count, 0) AS forms_count,
          COALESCE(form_stats.embedded_forms_count, 0) AS embedded_forms_count
        FROM users u
        LEFT JOIN (
          SELECT
            user_id,
            COUNT(*) AS forms_count,
            COALESCE(SUM(CASE WHEN COALESCE(is_embedded, 0) = 1 THEN 1 ELSE 0 END), 0) AS embedded_forms_count
          FROM forms
          GROUP BY user_id
        ) form_stats ON form_stats.user_id = u.id
        WHERE u.id = ?
        LIMIT 1
      `,
      [id]
    );

    const row = rows[0];

    if (!row) {
      return null;
    }

    const normalized = normalizeRow(row);
    return {
      ...normalized,
      fullName: row.full_name,
    };
  } finally {
    connection.release();
  }
}

export async function updateAdminUserStatus(id: string, status: 'active' | 'inactive') {
  await ensureAdminSchema();
  const connection = await pool.getConnection();

  try {
    const [result]: any = await connection.execute(
      'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

export async function updateAdminUser(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    billingPlan: 'free' | 'paid';
    avatarUrl: string | null;
  }>
) {
  await ensureAdminSchema();
  const connection = await pool.getConnection();

  try {
    const fields: string[] = [];
    const values: Array<string | null> = [];

    if (data.name !== undefined) {
      fields.push('full_name = ?');
      values.push(data.name);
    }

    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }

    if (data.role !== undefined) {
      fields.push('role = ?');
      values.push(data.role);
    }

    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (data.billingPlan !== undefined) {
      fields.push('billing_plan = ?');
      values.push(data.billingPlan);
    }

    if (data.avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      values.push(data.avatarUrl);
    }

    if (!fields.length) {
      return false;
    }

    values.push(id);

    const [result]: any = await connection.execute(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

export async function deleteAdminUser(id: string) {
  await ensureAdminSchema();
  const connection = await pool.getConnection();

  try {
    const [result]: any = await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  } finally {
    connection.release();
  }
}

export async function resetAdminUserPassword(id: string) {
  const temporaryPassword = nanoid(14);
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);
  await ensureAdminSchema();
  const connection = await pool.getConnection();

  try {
    const [result]: any = await connection.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [passwordHash, id]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return { temporaryPassword };
  } finally {
    connection.release();
  }
}
