import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminDashboardPage } from '@/components/admin/AdminDashboardPage';

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  if (user.role !== 'super_admin') {
    redirect('/dashboard');
  }

  return <AdminDashboardPage currentUserName={user.name} />;
}
