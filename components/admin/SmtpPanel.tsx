'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { SmtpSettings } from '@/lib/types/database';
import { Mail, LockKeyhole, RefreshCcw } from 'lucide-react';

export function SmtpPanel() {
  const [form, setForm] = useState<SmtpSettings>({
    host: '',
    port: 465,
    user: '',
    password: '',
    secure: true,
    from_email: '',
    from_name: 'Ziya Forms',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/smtp');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load SMTP settings');
      }
      if (data.settings) {
        setForm(data.settings);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/smtp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save SMTP settings');
      }
      setNotice('SMTP settings saved.');
      if (data.settings) {
        setForm(data.settings);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-white/60 bg-white/75 shadow-[0_15px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">SMTP</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Sender configuration</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Configure the SMTP credentials used for transactional emails.</p>
        </div>
        <Button variant="outline" onClick={fetchSettings}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reload
        </Button>
      </div>

      {loading ? (
        <div className="py-10 text-sm text-slate-500">Loading SMTP settings...</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">SMTP Host</span>
            <input value={form.host} onChange={(e) => setForm((prev) => ({ ...prev, host: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Port</span>
            <input type="number" value={form.port} onChange={(e) => setForm((prev) => ({ ...prev, port: Number(e.target.value) }))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</span>
            <input value={form.user} onChange={(e) => setForm((prev) => ({ ...prev, user: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
            <input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">From Email</span>
            <input value={form.from_email} onChange={(e) => setForm((prev) => ({ ...prev, from_email: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">From Name</span>
            <input value={form.from_name} onChange={(e) => setForm((prev) => ({ ...prev, from_name: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <input type="checkbox" checked={!!form.secure} onChange={(e) => setForm((prev) => ({ ...prev, secure: e.target.checked }))} />
            <span className="text-sm text-slate-700 dark:text-slate-300">Use secure connection (TLS/SSL)</span>
          </label>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><Mail className="h-4 w-4" /> SMTP Overview</div>
            <p className="mt-3">These settings control the sender identity and transport for ZiyaForms platform emails.</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><LockKeyhole className="h-4 w-4" /> Keep credentials limited to super admin access.</div>
          </div>

          {notice && <div className="lg:col-span-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">{notice}</div>}
          {error && <div className="lg:col-span-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>}

          <div className="lg:col-span-2 flex justify-end">
            <Button onClick={saveSettings} isLoading={saving} className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white">
              Save SMTP Settings
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
