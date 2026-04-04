'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getInitials } from '@/lib/utils';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 shadow-xl border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Link href={session ? "/dashboard" : "/"}>
              <div className="flex items-center gap-3 cursor-pointer group">
                <Image
                  src="/ziyavoicelogo.png"
                  alt="Ziya Forms Logo"
                  width={102}
                  height={102}
                  className="rounded-lg object-cover"
                />
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  Ziya Forms
                </h1>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <ThemeToggle />
                <div className="hidden sm:flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-sm font-semibold">
                      {session.user?.name ? getInitials(session.user.name) : session.user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium drop-shadow">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm">
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