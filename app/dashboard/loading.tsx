import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[color:var(--bg-primary-light)] px-6 py-8 dark:bg-[color:var(--bg-primary)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-3xl border border-[color:var(--border-light)] bg-[color:var(--bg-surface-light)] p-6 dark:border-[color:var(--border-default)] dark:bg-[color:var(--bg-surface)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-5 w-[28rem]" />
            </div>
            <Skeleton className="h-12 w-36 rounded-full" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
