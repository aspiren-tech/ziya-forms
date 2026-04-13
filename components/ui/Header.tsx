'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useSession, signOut } from 'next-auth/react';
import { getInitials } from '@/lib/utils';

export default function Header() {
  const { data: session } = useSession();
  const homeHref = session?.user?.role === 'super_admin' ? '/admin/dashboard' : session ? '/dashboard' : '/';
  const [avatarUrl, setAvatarUrl] = useState<string | null>(session?.user?.avatarUrl || null);
  const [displayName, setDisplayName] = useState<string>(session?.user?.name || session?.user?.email || 'Profile');
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setDisplayName(session?.user?.name || session?.user?.email || 'Profile');
  }, [session?.user?.email, session?.user?.name]);

  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  useEffect(() => {
    if (!session) {
      setAvatarUrl(null);
      return;
    }

    let cancelled = false;

    const loadProfileAvatar = async () => {
      try {
        const response = await fetch('/api/users/me', { credentials: 'include' });
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setAvatarUrl(data.user?.avatar_url || session.user?.avatarUrl || null);
        }
      } catch {
        if (!cancelled) {
          setAvatarUrl(session.user?.avatarUrl || null);
        }
      }
    };

    void loadProfileAvatar();

    const handleProfileUpdated = () => {
      void loadProfileAvatar();
    };

    window.addEventListener('profile-updated', handleProfileUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener('profile-updated', handleProfileUpdated);
    };
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-[color:var(--border-light)] bg-[color:var(--bg-surface-light)]/95 text-[color:var(--text-primary-light)] shadow-sm backdrop-blur dark:border-[color:var(--border-default)] dark:bg-[color:var(--bg-secondary)]/90 dark:text-[color:var(--text-primary)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href={homeHref} className="flex items-center">
          <Image
            src="/ziyavoicelogo.png"
            alt="Ziya Forms"
            width={180}
            height={56}
            className="h-10 w-auto object-contain sm:h-12 lg:h-14"
            priority
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {session ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full border border-[color:var(--border-light)] bg-[color:var(--bg-primary-light)] px-2 py-2 text-[color:var(--text-primary-light)] transition hover:bg-[color:var(--active-nav-light)]/70 hover:border-[color:var(--brand-primary-light)] dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 dark:hover:border-white/20 sm:px-3"
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[color:var(--brand-primary-light)] text-white dark:bg-[color:var(--brand-primary)]">
                  {avatarUrl && !avatarError ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="text-sm font-semibold">
                      {session.user?.name ? getInitials(session.user.name) : session.user?.email?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold leading-none">{displayName}</span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-[color:var(--border-light)] text-[color:var(--text-primary-light)] hover:bg-[color:var(--active-nav-light)]/70 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                onClick={handleSignOut}
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-[color:var(--border-light)] text-[color:var(--text-primary-light)] hover:bg-[color:var(--active-nav-light)]/70 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
