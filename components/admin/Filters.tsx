'use client';

import { Filter } from 'lucide-react';

type FiltersProps = {
  status: string;
  onStatusChange: (value: string) => void;
};

export function Filters({ status, onStatusChange }: FiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <Filter className="h-4 w-4 text-slate-500" />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}
