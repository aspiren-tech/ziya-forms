'use client';

import { ChevronLeft, ChevronRight, Loader2, UserCircle2 } from 'lucide-react';
import type { AdminUserSummary } from '@/lib/types/database';
import { UserActionsMenu } from './UserActionsMenu';

type UsersTableProps = {
  users: AdminUserSummary[];
  total: number;
  page: number;
  limit: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onView: (user: AdminUserSummary) => void;
  onEdit: (user: AdminUserSummary) => void;
  onToggleStatus: (user: AdminUserSummary) => void;
  onToggleBillingPlan: (user: AdminUserSummary) => void;
  onDelete: (user: AdminUserSummary) => void;
  onResetPassword: (user: AdminUserSummary) => void;
};

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  inactive: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20',
};

export function UsersTable({
  users,
  total,
  page,
  limit,
  loading,
  onPageChange,
  onView,
  onEdit,
  onToggleStatus,
  onToggleBillingPlan,
  onDelete,
  onResetPassword,
}: UsersTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_15px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50/80 dark:bg-slate-900/60">
            <tr>
              {['Name', 'Email', 'Status', 'Role', 'Forms Count', 'Embedded Forms Count', 'Created At', 'Actions'].map((label) => (
                <th key={label} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <div className="inline-flex items-center gap-3 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-slate-500">
                    <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-900">
                      <UserCircle2 className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No users found</h3>
                    <p className="text-sm">Try clearing the search or changing the status filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="bg-white/80 transition hover:bg-slate-50 dark:bg-slate-950/40 dark:hover:bg-slate-900/40">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                    {user.role === 'super_admin' && (
                      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">Super Admin</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[user.status]}`}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm capitalize text-slate-600 dark:text-slate-300">{user.role.replace('_', ' ')}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">{user.formsCount}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">{user.embeddedFormsCount}</td>
                  <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <UserActionsMenu
                      user={user}
                      onView={onView}
                      onEdit={onEdit}
                      onToggleStatus={onToggleStatus}
                      onToggleBillingPlan={onToggleBillingPlan}
                      onDelete={onDelete}
                      onResetPassword={onResetPassword}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing page <span className="font-semibold text-slate-900 dark:text-white">{page}</span> of{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span> ·{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{total}</span> total users
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
