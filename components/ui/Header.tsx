'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { getInitials } from '@/lib/utils';

export default function Header() {
  const { data: session } = useSession();
  const homeHref = session?.user?.role === 'super_admin' ? '/admin/dashboard' : session ? '/dashboard' : '/';

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <nav className="border-b border-[color:var(--border-light)] bg-[color:var(--bg-surface-light)] text-[color:var(--text-primary-light)] shadow-lg dark:border-[color:var(--border-default)] dark:bg-[color:var(--bg-secondary)] dark:text-[color:var(--text-primary)]">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Link href={homeHref}>
              <div className="flex items-center gap-3 cursor-pointer group">
                <Image
                  src="/ziyavoicelogo.png"
                  alt="Ziya Forms Logo"
                  width={202}
                  height={202}
                  className="rounded-lg object-cover"
                />
                {/* <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  Ziya Forms
                </h1> */}
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <ThemeToggle />
                <Link href="/profile" className="hidden sm:flex items-center gap-3 rounded-full border border-[color:var(--border-light)] bg-[color:var(--bg-primary-light)] px-3 py-2 text-[color:var(--text-primary-light)] transition hover:bg-[color:var(--active-nav-light)]/70 hover:border-[color:var(--brand-primary-light)] dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 dark:hover:border-white/20">
                  <div className="w-8 h-8 bg-[color:var(--brand-primary-light)] rounded-full flex items-center justify-center backdrop-blur-sm text-white dark:bg-[color:var(--brand-primary)]">
                    <span className="text-sm font-semibold">
                      {session.user?.name ? getInitials(session.user.name) : session.user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-semibold">
                      {session.user?.name || session.user?.email}
                    </span>
                    <span className="block text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-secondary-light)] dark:text-white/70">
                      My profile
                    </span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="border border-[color:var(--border-light)] text-[color:var(--text-primary-light)] hover:bg-[color:var(--active-nav-light)]/70 dark:border-white/20 dark:text-white dark:hover:bg-white/10 backdrop-blur-sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="border border-[color:var(--border-light)] text-[color:var(--text-primary-light)] hover:bg-[color:var(--active-nav-light)]/70 dark:border-white/20 dark:text-white dark:hover:bg-white/10 backdrop-blur-sm">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
