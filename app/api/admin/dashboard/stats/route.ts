import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAdminDashboardStats } from '@/lib/mysql/admin';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'super_admin') {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const stats = await getAdminDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in GET /api/admin/dashboard/stats:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
