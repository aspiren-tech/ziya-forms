'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder = 'Search by name or email' }: SearchBarProps) {
  return (
    <div className="relative w-full min-w-[260px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 shadow-sm"
      />
    </div>
  );
}
