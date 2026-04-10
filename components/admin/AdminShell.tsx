'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type AdminShellProps = {
  currentUserName?: string | null;
  children: ReactNode;
};

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/templates', label: 'Templates panel' },
  { href: '/admin/smtp', label: 'SMTP' },
] as const;

export function AdminShell({ currentUserName, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,132,242,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(87,213,139,0.18),_transparent_25%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,132,242,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(87,213,139,0.12),_transparent_25%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1760px] flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 lg:w-72">
          <div className="sticky top-4 rounded-[2rem] border border-white/50 bg-white/80 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Admin Panels</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">ZiyaForms</h2>
            </div>

            <nav className="mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {adminNavItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900/70'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">
              <p className="font-semibold">Current account</p>
              <p className="mt-1">{currentUserName || 'Super admin'}</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
