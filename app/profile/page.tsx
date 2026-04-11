'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ImageCropPicker } from '@/components/forms/ImageCropPicker';
import { ArrowLeft, CalendarDays, Mail, Shield, Sparkles, UserRound } from 'lucide-react';

type ProfileData = {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  status?: string | null;
  role?: string | null;
  billing_plan?: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch('/api/users/me');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load profile');
        }

        setProfile(data.user || null);
      } catch (error) {
        console.error('Failed to load profile:', error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router, session, status]);

  const saveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setProfile(data.user || profile);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-white" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-primary-light)] text-[color:var(--text-primary-light)] dark:bg-[color:var(--bg-primary)] dark:text-[color:var(--text-primary)]">
      <div className="container mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2 border-[color:var(--border-light)] bg-[color:var(--bg-surface-light)] text-[color:var(--text-primary-light)] hover:bg-[color:var(--active-nav-light)]/60 dark:border-[color:var(--border-default)] dark:bg-[color:var(--bg-surface)] dark:text-[color:var(--text-primary)] dark:hover:bg-[color:var(--bg-surface-hover)]">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Button>
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-[color:var(--border-light)] bg-[color:var(--bg-surface-light)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--text-secondary-light)] shadow-lg backdrop-blur dark:border-[color:var(--border-default)] dark:bg-[color:var(--bg-surface)] dark:text-[color:var(--text-secondary)] md:inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            Profile center
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="overflow-hidden border border-[color:var(--border-light)] bg-[color:var(--bg-surface-light)] p-0 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur dark:border-[color:var(--border-default)] dark:bg-[color:var(--bg-surface)]">
            <div
              className="px-8 py-10 text-white"
              style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--brand-primary), var(--brand-accent))' }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-18 w-18 items-center justify-center overflow-hidden rounded-full bg-white/10 shadow-xl ring-1 ring-white/15">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile?.full_name || 'Profile'} className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-white/60">Account</p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight">{profile?.full_name || session.user?.name || 'Your profile'}</h1>
                  <p className="mt-1 text-white/70">{profile?.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-8 py-8">
              <div className="grid gap-3 text-sm text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>{profile?.role || 'user'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Joined recently'}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-[color:var(--bg-primary-light)] p-4 dark:bg-[color:var(--bg-surface-hover)]">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)] dark:text-[color:var(--text-muted)]">Plan</p>
                <p className="mt-1 text-lg font-semibold capitalize text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">
                  {profile?.billing_plan || 'free'}
                </p>
              </div>

              <div className="rounded-2xl border border-dashed border-[color:var(--border-light)] p-4 text-sm text-[color:var(--text-secondary-light)] dark:border-[color:var(--border-default)] dark:text-[color:var(--text-secondary)]">
                Update your name and picture here. The dashboard header will use this profile automatically.
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border border-[color:var(--border-light)] bg-[color:var(--bg-surface-light)] shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur dark:border-[color:var(--border-default)] dark:bg-[color:var(--bg-surface)]">
            <div className="border-b border-[color:var(--border-light)] px-6 py-4 dark:border-[color:var(--border-default)]">
              <h2 className="text-lg font-semibold text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">Edit profile</h2>
              <p className="text-sm text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)]">Make your account feel more personal.</p>
            </div>

            <div className="space-y-6 p-6">
              <ImageCropPicker
                label="Profile photo"
                description="Choose a clean square avatar."
                value={profile?.avatar_url || null}
                onChange={(avatarUrl) => setProfile((current) => current ? { ...current, avatar_url: avatarUrl } : current)}
                aspectRatio={1}
                buttonLabel="Choose photo"
                emptyLabel="Add a profile picture."
                cropTitle="Crop profile photo"
                cropHint="Drag to position the image inside the square frame."
                previewClassName="rounded-full"
                className="mx-auto max-w-[240px]"
                uploadScope="users/avatars"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-[color:var(--text-secondary-light)] dark:text-[color:var(--text-secondary)]">Full name</label>
                <input
                  value={profile?.full_name || ''}
                  onChange={(event) => setProfile((current) => current ? { ...current, full_name: event.target.value } : current)}
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-[color:var(--border-light)] bg-[color:var(--bg-primary-light)] px-4 py-3 text-[color:var(--text-primary-light)] outline-none transition focus:border-[color:var(--brand-primary-light)] focus:bg-white dark:border-[color:var(--border-default)] dark:bg-[color:var(--bg-surface-hover)] dark:text-[color:var(--text-primary)]"
                />
              </div>

              <div className="grid gap-3 rounded-2xl bg-[color:var(--bg-primary-light)] p-4 text-sm text-[color:var(--text-secondary-light)] dark:bg-[color:var(--bg-surface-hover)] dark:text-[color:var(--text-secondary)]">
                <div className="flex items-center justify-between">
                  <span>Email</span>
                  <span className="font-medium text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">{profile?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="font-medium capitalize text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">{profile?.status || 'active'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Role</span>
                  <span className="font-medium capitalize text-[color:var(--text-primary-light)] dark:text-[color:var(--text-primary)]">{profile?.role || 'user'}</span>
                </div>
              </div>

              <Button
                onClick={saveProfile}
                isLoading={isSaving}
                className="w-full bg-[color:var(--brand-primary-light)] text-white hover:opacity-95 dark:bg-[color:var(--brand-primary)]"
              >
                Save profile
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
