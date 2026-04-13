import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[color:var(--bg-primary-light)] px-6 py-8 dark:bg-[color:var(--bg-primary)]">
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-20 rounded-3xl" />
        <Skeleton className="h-[36rem] rounded-3xl" />
      </div>
    </div>
  );
}
