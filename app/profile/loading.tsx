import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[color:var(--bg-primary-light)] px-6 py-8 dark:bg-[color:var(--bg-primary)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-11 w-36" />
          <Skeleton className="hidden h-9 w-32 rounded-full md:block" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Skeleton className="h-[34rem] rounded-3xl" />
          <Skeleton className="h-[34rem] rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
